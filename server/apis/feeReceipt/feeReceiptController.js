const FeeReceipt = require('./feeReceiptModel')
const SessionYear = require('../sessionYear/sessionYearModel')
const CalculateFee = require('../calculateFees/calculateFeeModel')
const Admission = require('../admission/admissionModel')
const Student = require('../student/studentModel')
const Fine = require('../fine/fineModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')
const { totalmem } = require('os')
const moment = require('moment');



module.exports = {
  index,
  fetchFeeReceiptById,
  addFeeReceipt,
  addFeeReceiptOfDirectCollection,
  updateFeeReceipt,
  deleteFeeReceipt
}

async function index(req, res, next) {
  await indexFun(req, next).then(next).catch(next);
};


function indexFun(req, next) {
  return new Promise(async (resolve, reject) => {
    var lim = 100000;
    var skip1 = 0;
    let formData = {};
    if (req.body != undefined)
      formData = req.body;
    else formData = req;
    if (formData.deletedReceipts === 'hide') {
      formData.isDelete = false;
    } else if (formData.deletedReceipts === 'all') {
      formData.isDelete = true;
    } else if (formData.deletedReceipts === 'show') {
      delete formData.isDelete;
    } else {
      formData.isDelete = false;
    }

    if (formData.startpoint != undefined) {
      skip1 = parseInt(formData.startpoint);
      lim = 10;
      delete formData.startpoint;
    }

    if (!!formData.startDate && !!formData.endDate) {
      let start = new Date(formData.startDate);
      start.setHours(0, 0, 0, 0);
      let end = new Date(formData.endDate);
      end.setHours(23, 59, 59, 999);
      formData.createdAt = { $gt: start, $lt: end };
      delete formData.startDate;
      delete formData.endDate;
    }

    if (req.headers != undefined && req.headers.sessionyearid != undefined && db.isValid(req.headers.sessionyearid)) {
      formData.sessionYearId = req.headers.sessionyearid;
    }

    if (!!formData.removeSession && formData.removeSession == 'true') {
      delete formData.sessionYearId;
    }

    if (!!formData.search) {
      const searchRegex = new RegExp(formData.search, 'i');
      const searchNumber = parseInt(formData.search, 10);
      const matchingStudents = await Student.find({ studentName: searchRegex }).select('_id');
      const studentIds = matchingStudents.map(student => student._id);
      const matchingAdmissions = await Admission.find({ studentId: { $in: studentIds } }).select('_id');
      const admissionIds = matchingAdmissions.map(admission => admission._id);
      formData.$or = [
        !isNaN(searchNumber) ? { feeReceiptAutoId: searchNumber } : null,
        { manualReceiptNumber: searchRegex },
        { admissionId: { $in: admissionIds } }
      ].filter(Boolean);

      delete formData.search;
    }


    var find = { $and: [formData] };

    FeeReceipt.find(find)
      .skip(skip1)
      .limit(lim)
      .populate('admissionId')
      .populate('collectedBy')
      .populate({ path: 'admissionId', populate: { path: 'studentId college technologies.course' } })
      .populate('calculateFeeId')
      .populate({
        path: 'admissionId',
        populate: {
          path: 'studentId',
          model: 'student',
          select: 'studentName'
        }
      })

      .sort({ createdAt: -1 })
      .exec()
      .then(async alldocuments => {
        var total = 0;
        total = await FeeReceipt.countDocuments(find);

        let totalAmountReceived = alldocuments.reduce((sum, doc) => sum + (doc.amountPaid || 0), 0);
        let deletedReceiptCount = alldocuments.filter(doc => doc.isDelete === true).length;

        let filterDeleted = alldocuments.filter(receipts => receipts.isDelete == true);
        let deletedReceiptAmount = filterDeleted.reduce((n, { amountPaid }) => n + amountPaid, 0);
        let netAmount = totalAmountReceived - deletedReceiptAmount;

        resolve({
          status: 200,
          success: true,
          total: total,
          message: "All FeeReceipts Loaded",
          data: alldocuments,
          totalAmountReceived: totalAmountReceived,
          deletedReceiptCount: deletedReceiptCount,
          deletedReceiptAmount: deletedReceiptAmount,
          netAmount: netAmount
        });
      })
      .catch(next);
  });
}


async function addFeeReceipt(req, res, next) {
  await addFeeReceiptFun(req, next).then(next).catch(next);
}

function addFeeReceiptFun(req, next) {
  return new Promise(async (resolve, reject) => {
    const formData = req.body
    const createSchema = Joi.object().keys({
      calculateFeeId: Joi.string().required(),
      admissionId: Joi.string().required(),
      installmentNumber: Joi.number().required(),
      amountPaid: Joi.number().required(),
      collectedOn: Joi.any(),
      collectedBy: Joi.string().required(),
      paymentMethod: Joi.string().required(),
      company: Joi.optional()
    }).unknown(true);
    const result = createSchema.validate(formData)
    const { value, error } = result
    const valid = error == null
    if (!valid) {
      const { details } = error;
      // helper.unlinkImage(req.file)
      reject({
        status: 400,
        success: false,
        message: details.map(i => i.message).join(',')
      });
    } else {
      await CalculateFee.findOne({ $and: [{ _id: formData.calculateFeeId }, { admissionId: formData.admissionId }, { isDelete: false }] }).then(async calculateFeeData => {
        if (!!calculateFeeData) {
          var admission = await Admission.findOne({ _id: formData.admissionId }).exec()
          FeeReceipt.countDocuments()
            .then(async total => {
              var feeReceipt = FeeReceipt()
              feeReceipt.feeReceiptAutoId = total + 1
              feeReceipt.calculateFeeId = formData.calculateFeeId
              feeReceipt.admissionId = formData.admissionId
              feeReceipt.installmentNumber = formData.installmentCount
              if (formData.installmentNumber == 0) feeReceipt.isRegistrationSlip = true
              feeReceipt.amountPaid = formData.amountPaid
              feeReceipt.collectedBy = formData.collectedBy
              feeReceipt.collectedOn = formData.collectedOn
              feeReceipt.paymentMethod = formData.paymentMethod
              feeReceipt.remarks = formData.remarks

              let admissionData = await Admission.findOne({ _id: formData.admissionId })
              if (admissionData.company) {
                feeReceipt.company = admissionData.company
              }
              else {
                if (!formData.company) {
                  reject({ success: false, status: 422, message: "company is required" })
                } else {

                  feeReceipt.company = formData.company
                }

              }
              feeReceipt.batches = admission.batches
              feeReceipt.receiptType = formData.receiptType
              feeReceipt.courseTaken = formData.courseTaken

              // if receipt is manual receipt
              if (feeReceipt.receiptType == 1) {
                feeReceipt.manualReceiptNumber = formData.manualReceiptNumber
              }
              if (!!req.headers.sessionyearid) feeReceipt.sessionYearId = req.headers.sessionyearid
              // console.log(1);
              let session = await SessionYear.findOne({ isActive: true })
              if (!!session && !!req.headers.sessionyearid) feeReceipt.sessionYearId = session._id
              // if (!!formData.collectedOn) feeReceipt.collectedOn = formData.collectedOn
              if (req.decoded.addedById) feeReceipt.addedById = req.decoded.addedById
              // Fine .............................................
              feeReceipt.totalFine = formData.totalFine
              feeReceipt.finePaid = formData.finePaid
              feeReceipt.reason = formData.reason
              // Fine .............................................
              feeReceipt.save()
                .then(saveRes => {
                  // receipt head
                  var receiptHead = [];
                  if (formData.installmentNumber == 0) { // to check is this pending registration fee
                    // console.log(2);
                    let amountPaid = parseInt(formData.amountPaid)
                    // console.log("amountPaid" ,amountPaid,  "Pending registration", formData.registrationFeePending);

                    if (amountPaid < calculateFeeData.registrationFeePending) {
                      calculateFeeData.registrationFeePending -= amountPaid
                      calculateFeeData.isPendingRegistrationPaid = false

                      calculateFeeData.installments[0].isAddedFromRegistration = true
                      calculateFeeData.installments[0].amountAddedFromRegistration = calculateFeeData.registrationFeePending
                      calculateFeeData.installments[0].amountToBePaid += calculateFeeData.registrationFeePending
                      receiptHead.push("Registration");
                      calculateFeeData.nextInstallment = 1
                    }
                    else {
                      if (amountPaid > calculateFeeData.registrationFeePending) { // if paid extra fee in registration
                        let installmentObj = calculateFeeData.installments[0]
                        installmentObj.paidAmount = amountPaid - calculateFeeData.registrationFeePending
                        installmentObj.createdAt = Date.now()
                        installmentObj.paidAt = formData.collectedOn
                        installmentObj.collectedBy = formData.collectedBy
                        receiptHead.push("Registration");

                        if (installmentObj.paidAmount < installmentObj.amountToBePaid) { // if paid less than installment amount
                          // console.log(5);
                          installmentObj.isBalancePending = true
                          installmentObj.balance = installmentObj.amountToBePaid - installmentObj.paidAmount
                          let balancePaymentsObj = {
                            amountToBePaid: installmentObj.balance
                          }
                          installmentObj.balancePayments.push(balancePaymentsObj)
                          receiptHead.push(`Installment ${installmentObj.installmentNo}`);
                          calculateFeeData.nextInstallment = 1;
                        }
                        else if (installmentObj.paidAmount == installmentObj.amountToBePaid) { //  when paid the same amount
                          // console.log(6);
                          installmentObj.isBalancePending = false
                          installmentObj.balance = 0
                          calculateFeeData.nextInstallment++;
                          receiptHead.push(`Installment ${installmentObj.installmentNo}`);
                          calculateFeeData.nextInstallment = 2;
                        }
                        else { // when paid extra
                          // console.log(7);
                          if (amountPaid == calculateFeeData.totalBalance) { // when paid total balance
                            // console.log(8);
                            installmentObj.isBalancePending = false
                            installmentObj.balance = 0
                            for (let i = formData.installmentNumber; i < calculateFeeData.installments.length; i++) {
                              calculateFeeData.installments[i].isBalancePending = false
                              calculateFeeData.installments[i].balance = 0
                              receiptHead.push(`Installment ${calculateFeeData.installments[i].installmentNo}`);
                            }
                          }
                          else { // when paid less than total balance
                            // console.log(9);


                            // extra 10000
                            let extra = installmentObj.paidAmount;

                            // installmentObj[0].paidAmount =
                            // installmentObj.paidAmount = installmentObj.amountToBePaid

                            // installmentObj.isBalancePending = false
                            // installmentObj.balance = 0


                            // console.log(extra);
                            receiptHead.push(`Installment ${installmentObj.installmentNo}`);
                            for (let i = formData.installmentNumber; extra > 0; i++) {
                              if (extra >= calculateFeeData.installments[i]?.amountToBePaid) {
                                // console.log(10);
                                extra -= calculateFeeData.installments[i].amountToBePaid
                                calculateFeeData.installments[i].paidAmount = calculateFeeData.installments[i].amountToBePaid

                                calculateFeeData.installments[i].isBalancePending = false
                                calculateFeeData.installments[i].balance = 0

                              }
                              else {
                                // console.log(11);
                                calculateFeeData.installments[i].paidAmount = extra
                                calculateFeeData.installments[i].isBalancePending = true
                                calculateFeeData.installments[i].balance = calculateFeeData.installments[i].amountToBePaid - calculateFeeData.installments[i].paidAmount
                                let balanceObj = {
                                  "amountToBePaid": calculateFeeData.installments[i].balance,
                                  paidAmount: null,
                                  paidAt: null,
                                  collectedBy: null
                                }
                                calculateFeeData.installments[i].balancePayments.push(balanceObj)
                                extra = 0
                              }
                              calculateFeeData.installments[i].createdAt = Date.now()
                              calculateFeeData.installments[i].paidAt = formData.collectedOn
                              calculateFeeData.installments[i].collectedBy = formData.collectedBy;
                              receiptHead.push(`Installment ${calculateFeeData.installments[i].installmentNo}`);
                              calculateFeeData.nextInstallment++;
                            }
                          }
                        }
                      }
                      if(amountPaid == calculateFeeData.registrationFeePending) {
                        calculateFeeData.nextInstallment = 1;
                      }

                      calculateFeeData.registrationFeePending = 0
                      calculateFeeData.isRegistrationFeePending = false
                      calculateFeeData.isPendingRegistrationPaid = true

                    }
                    calculateFeeData.registrationFeePaid += amountPaid
                    calculateFeeData.pendingRegistraionPaidAt = formData.collectedOn

                    calculateFeeData.totalFeePaid += amountPaid
                    calculateFeeData.totalBalance = calculateFeeData.totalFeeToBePaid - calculateFeeData.totalFeePaid


                    if (calculateFeeData.totalBalance == 0) {
                      calculateFeeData.isTotalFeePaid = true
                      calculateFeeData.nextInstallment = -1
                    }
                  }
                  else {
                    calculateFeeData.totalFeePaid += Number(formData.amountPaid)
                    if (formData.installmentNumber == 1 && calculateFeeData.isPendingRegistrationPaid == false) {
                      if (calculateFeeData.totalFeePaid >= calculateFeeData.registrationFeePayable) {
                        calculateFeeData.isPendingRegistrationPaid = true
                        calculateFeeData.isRegistrationFeePending = false
                        receiptHead.push(`Registration`);
                      }
                    }
                    // console.log(3);
                    let installmentObj = calculateFeeData.installments[formData.installmentNumber - 1]
                    if (installmentObj.paidAmount == 0) {  // installment payment
                      // console.log(4);
                      installmentObj.paidAmount = formData.amountPaid
                      installmentObj.createdAt = Date.now()
                      installmentObj.paidAt = formData.collectedOn
                      installmentObj.collectedBy = formData.collectedBy
                      if (installmentObj.paidAmount < installmentObj.amountToBePaid) { // if paid less than installment amount
                        // console.log(5);
                        installmentObj.isBalancePending = true
                        installmentObj.balance = installmentObj.amountToBePaid - installmentObj.paidAmount
                        let balancePaymentsObj = {
                          amountToBePaid: installmentObj.balance
                        }
                        installmentObj.balancePayments.push(balancePaymentsObj);
                        receiptHead.push(`Installment ${installmentObj.installmentNo}`);

                      }
                      else if (installmentObj.paidAmount == installmentObj.amountToBePaid) { //  when paid the same amount
                        // console.log(6);
                        installmentObj.isBalancePending = false
                        installmentObj.balance = 0
                        calculateFeeData.nextInstallment++
                        receiptHead.push(`Installment ${installmentObj.installmentNo}`);
                      }
                      else { // when paid extra
                        // console.log(7);
                        if (formData.amountPaid == calculateFeeData.totalBalance) { // when paid total balance
                          // console.log(8);
                          installmentObj.isBalancePending = false
                          installmentObj.balance = 0
                          for (let i = formData.installmentNumber; i < calculateFeeData.installments.length; i++) {
                            calculateFeeData.installments[i].isBalancePending = false
                            calculateFeeData.installments[i].balance = 0
                            receiptHead.push(`Installment ${calculateFeeData.installments[i].installmentNo}`);
                          }
                          calculateFeeData.nextInstallment = calculateFeeData.totalInstallments + 1
                        }
                        else { // when paid less than total balance
                          // console.log(9);
                          installmentObj.paidAmount = installmentObj.amountToBePaid

                          installmentObj.isBalancePending = false
                          installmentObj.balance = 0

                          let extra = formData.amountPaid - installmentObj.paidAmount
                          receiptHead.push(`Installment ${installmentObj.installmentNo}`);
                          calculateFeeData.nextInstallment++;
                          // console.log(calculateFeeData.nextInstallment);
                          for (let i = formData.installmentNumber; extra > 0; i++) {
                            if (extra >= calculateFeeData.installments[i]?.amountToBePaid) {
                              // console.log(10);
                              extra -= calculateFeeData.installments[i].amountToBePaid
                              calculateFeeData.installments[i].paidAmount = calculateFeeData.installments[i].amountToBePaid

                              calculateFeeData.installments[i].isBalancePending = false
                              calculateFeeData.installments[i].balance = 0
                              console.log(`${calculateFeeData?.nextInstallment}---${i}---- ${calculateFeeData.installments[i].balance}`);
                              calculateFeeData.nextInstallment++;
                            }
                            else {
                              // console.log(11);
                              calculateFeeData.installments[i].paidAmount = extra
                              calculateFeeData.installments[i].isBalancePending = true
                              calculateFeeData.installments[i].balance = calculateFeeData.installments[i].amountToBePaid - calculateFeeData.installments[i].paidAmount
                              let balanceObj = {
                                "amountToBePaid": calculateFeeData.installments[i].balance,
                                paidAmount: null,
                                paidAt: null,
                                collectedBy: null
                              }
                              calculateFeeData.installments[i].balancePayments.push(balanceObj)
                              extra = 0
                              console.log(`${calculateFeeData?.nextInstallment}---${i}---- ${calculateFeeData.installments[i].balance}`);
                            }
                            calculateFeeData.installments[i].createdAt = Date.now()
                            calculateFeeData.installments[i].paidAt = formData.collectedOn
                            calculateFeeData.installments[i].collectedBy = formData.collectedBy
                            // calculateFeeData.nextInstallment++;
                            // console.log(calculateFeeData.nextInstallment);
                            receiptHead.push(`Installment ${calculateFeeData.installments[i].installmentNo}`);
                          }
                        }

                      }

                    }
                    else { // pending Installment payment
                      // console.log(12);
                      let length = installmentObj.balancePayments.length
                      let balancePaymentsObj = installmentObj['balancePayments'][length - 1]
                      balancePaymentsObj['paidAmount'] = formData.amountPaid
                      // console.log('log log')
                      balancePaymentsObj['paidAt'] = formData.collectedOn
                      balancePaymentsObj['collectedBy'] = formData.collectedBy

                      if (balancePaymentsObj.paidAmount < balancePaymentsObj.amountToBePaid) {
                        // if paid less than pending payment
                        // console.log(13);
                        let pendingBalanceObj = {
                          amountToBePaid: balancePaymentsObj.amountToBePaid - balancePaymentsObj.paidAmount
                        }
                        installmentObj.balance = balancePaymentsObj.amountToBePaid - balancePaymentsObj.paidAmount
                        installmentObj.balancePayments.push(pendingBalanceObj)
                        receiptHead.push(`Installment ${installmentObj.installmentNo}`);
                      }
                      else if (balancePaymentsObj.paidAmount == balancePaymentsObj.amountToBePaid) { // if paid equal to pending payment
                        // console.log(14);
                        installmentObj.isBalancePending = false
                        installmentObj.balance = 0
                        calculateFeeData.nextInstallment++
                        receiptHead.push(`Installment ${installmentObj.installmentNo}`);

                      }
                      else {
                        // if paid extra
                        if (calculateFeeData.totalBalance == formData.amountPaid) {
                          // if paid total balance
                          // console.log(15);

                          installmentObj.isBalancePending = false
                          installmentObj.balance = 0
                          for (let i = formData.installmentNumber; i < calculateFeeData.installments.length; i++) {
                            calculateFeeData.installments[i].isBalancePending = false
                            calculateFeeData.installments[i].balance = 0
                            receiptHead.push(`Installment ${calculateFeeData.installments[i].installmentNo}`);
                          }
                          calculateFeeData.nextInstallment = calculateFeeData.totalInstallments + 1
                        }
                        else {
                          // if paid less than total balance
                          // console.log(16);
                          balancePaymentsObj['paidAmount'] = balancePaymentsObj.amountToBePaid
                          installmentObj.isBalancePending = false
                          installmentObj.balance = 0
                          receiptHead.push(`Installment ${installmentObj.installmentNo}`);
                          let extra = formData.amountPaid - balancePaymentsObj['paidAmount']
                          for (let i = formData.installmentNumber; extra > 0; i++) {
                            if (extra >= calculateFeeData.installments[i]?.amountToBePaid) {
                              // console.log(17);
                              extra -= calculateFeeData.installments[i].amountToBePaid
                              calculateFeeData.installments[i].paidAmount = calculateFeeData.installments[i].amountToBePaid

                              calculateFeeData.installments[i].isBalancePending = false
                              calculateFeeData.installments[i].balance = 0
                              calculateFeeData.nextInstallment++
                            }
                            else {
                              // console.log(18);
                              calculateFeeData.installments[i].paidAmount = extra
                              calculateFeeData.installments[i].isBalancePending = true
                              calculateFeeData.installments[i].balance = calculateFeeData.installments[i].amountToBePaid - calculateFeeData.installments[i].paidAmount
                              let balanceObj = {
                                "amountToBePaid": calculateFeeData.installments[i].balance,
                                paidAmount: null,
                                paidAt: null,
                                collectedBy: null
                              }
                              calculateFeeData.installments[i].balancePayments.push(balanceObj)
                              extra = 0
                            }
                            calculateFeeData.installments[i].createdAt = Date.now()
                            calculateFeeData.installments[i].paidAt = formData.collectedOn
                            calculateFeeData.installments[i].collectedBy = formData.collectedBy
                            calculateFeeData.nextInstallment++
                            receiptHead.push(`Installment ${calculateFeeData.installments[i].installmentNo}`);
                          }
                        }
                      }
                      installmentObj['balancePayments'][length - 1] = balancePaymentsObj
                    }

                    calculateFeeData.totalBalance = calculateFeeData.totalFeeToBePaid - calculateFeeData.totalFeePaid
                    if (calculateFeeData.totalBalance == 0 && calculateFeeData.totalInstallments < calculateFeeData.nextInstallment) {
                      calculateFeeData.isTotalFeePaid = true
                    }

                    calculateFeeData.installments[formData.installmentNumber - 1] = installmentObj
                  }
                  saveRes.receiptHead = receiptHead;
                  // console.log(saveRes.receiptHead);
                  // console.log(calculateFeeData.isTotalFeePaid, calculateFeeData.totalBalance,);
                  saveRes.save().then(() => { console.log('receipt Head Saved Success') }).catch(next)
                  calculateFeeData.save().then(async (savedFeeData) => {
                    saveRes.populate([{ path: 'admissionId', populate: 'studentId technologies.course college' }, 'collectedBy']).then(savedFeeData => {
                      if (calculateFeeData.totalBalance == 0) {
                        // let admission = await Admission.findOne({_id:formData.admissionId}).exec()

                        admission.isTotalFeePaid = true
                        console.log('total Paid')
                        admission.save()
                          .then((admissionData) => {
                            resolve({
                              status: 200, success: true, message: "FeeReceipt added successfully.", data: savedFeeData
                            })
                          })
                          .catch(next)
                      }
                      else
                        resolve({
                          status: 200, success: true, message: "FeeReceipt added successfully.", data: savedFeeData
                        })
                    })
                      .catch(next)
                  })
                    .catch(next)
                }).catch(next)

            })
        } else {
          // helper.unlinkImage(req.file)
          reject({ success: false, status: 422, message: "Fee data does not exist" })
        }

      })
    }
  })
}
async function addFeeReceiptOfDirectCollection(req, res, next) {
  await addFeeReceiptOfDirectCollectionFun(req, next).then(next).catch(next);
}
function addFeeReceiptOfDirectCollectionFun(req, res, next) {
  return new Promise(async (resolve, reject) => {
    const formData = req.body
    const createSchema = Joi.object().keys({
      calculateFeeId: Joi.string().required(),
      admissionId: Joi.string().required(),
      installmentNumber: Joi.number().required(),
      amountPaid: Joi.number().required(),
      collectedOn: Joi.any(),
      collectedBy: Joi.string().required()
    }).unknown(true);
    const result = createSchema.validate(formData)
    const { value, error } = result
    const valid = error == null
    if (!valid) {
      const { details } = error;
      // helper.unlinkImage(req.file)
      reject({
        status: 400,
        success: false,
        message: details.map(i => i.message).join(',')
      });
    } else {
      await CalculateFee.findOne({ $and: [{ _id: formData.calculateFeeId }, { admissionId: formData.admissionId }, { isDelete: false }] }).then(calculateFeeData => {
        if (!!calculateFeeData) {
          FeeReceipt.countDocuments()
            .then(async total => {
              var feeReceipt = FeeReceipt()
              feeReceipt.feeReceiptAutoId = total + 1
              feeReceipt.isDirectCollected = true
              feeReceipt.calculateFeeId = formData.calculateFeeId
              feeReceipt.admissionId = formData.admissionId
              feeReceipt.installmentNumber = formData.installmentNumber
              feeReceipt.amountPaid = formData.amountPaid
              feeReceipt.collectedBy = formData.collectedBy
              if (req.decoded.addedById) feeReceipt.addedById = req.decoded.addedById
              let session = await SessionYear.findOne({ isActive: true })
              if (!!session && !!req.headers.sessionyearid) feeReceipt.sessionYearId = session._id
              feeReceipt.save()
                .then(saveRes => {
                  let directCollection = calculateFeeData.directCollection
                  let obj = {}
                  obj.paidAmount = formData.amountPaid
                  obj.collectedBy = formData.collectedBy
                  obj.paidAt = formData.collectedOn
                  obj.createdAt = Date.now()
                  directCollection.push(obj)
                  calculateFeeData.directCollection = directCollection
                  calculateFeeData.isDirectCollected = true
                  calculateFeeData.totalBalance -= obj.paidAmount
                  // console.log("Total Balance", calculateFeeData.totalBalance);
                  if (calculateFeeData.totalBalance < 0) {
                    calculateFeeData.totalBalance = 0
                    calculateFeeData.isTotalFeePaid = true
                  }
                  else if (calculateFeeData.totalBalance > 0) {
                    calculateFeeData.nextInstallment++
                  }
                  else calculateFeeData.isTotalFeePaid = true
                  calculateFeeData.save().then(async (savedFeeData) => {
                    if (calculateFeeData.totalBalance == 0) {
                      let admission = await Admission.findOne({ _id: formData.admissionId }).exec()

                      admission.isTotalFeePaid = true
                      admission.save()
                        .then((admissionData) => {
                          resolve({
                            status: 200, success: true, message: "FeeReceipt added successfully.", data: saveRes
                          })
                        })
                        .catch(next)
                    }
                    else
                      resolve({
                        status: 200, success: true, message: "FeeReceipt added successfully.", data: saveRes
                      })
                  })
                    .catch(next)
                }).catch(err => {
                  // helper.unlinkImage(req.file)
                  reject({ success: false, status: 500, message: err })
                })

            })
        } else {
          // helper.unlinkImage(req.file)
          reject({ success: false, status: 422, message: "Fee data does not exist" })
        }

      })
    }
  })
}
async function fetchFeeReceiptById(req, res, next) {
  await fetchFeeReceiptByIdFun(req, next).then(next).catch(next);
};
function fetchFeeReceiptByIdFun(req, next) {
  let formData = req.body
  return new Promise(async (resolve, reject) => {
    if (formData != undefined && formData._id != undefined) {
      if (db.isValid(formData._id)) {
        var finder = { $and: [formData] };
        FeeReceipt.findOne(finder)
          .exec()
          .then(document => {
            if (document != null) {
              resolve({
                status: 200,
                success: true,
                message: "Single FeeReceipt Loaded",
                data: document
              });
            }
            else {
              reject("FeeReceipt not found");
            }
          })
          .catch(next)
      }
      else {
        reject("Id Format is Wrong")
      }
    }
    else {
      resolve("Please enter _id to Proceed ");
    }
  })
}
async function updateFeeReceipt(req, res, next) {
  await updateFeeReceiptFun(req).then(next).catch(next);
};
function updateFeeReceiptFun(req, next) {
  let formData = req.body
  let isValidated = true
  return new Promise((resolve, reject) => {
    if (formData != undefined && formData._id != undefined) {
      if (db.isValid(formData._id)) {
        FeeReceipt.findOne({ "_id": formData._id })
          .then(async res => {
            if (!res)
              reject("FeeReceipt not found");
            else {
              if (!!formData.calculateFeeId) res.calculateFeeId = formData.calculateFeeId
              if (!!formData.admissionId) res.admissionId = formData.admissionId
              if (!!formData.amountPaid) res.amountPaid = formData.amountPaid
              if (!!formData.company) res.company = formData.company
              if (!!formData.installmentNumber) res.installmentNumber = formData.installmentNumber
              if (!!formData.collectedBy) res.collectedBy = formData.collectedBy
              if (!!formData.collectedOn) res.collectedOn = formData.collectedOn
              if (!!formData.paymentMethod) res.paymentMethod = formData.paymentMethod
              if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
              let id = res._id
              // if (!!formData.feeReceipt) {
              //     await FeeReceipt.findOne({ $and: [{ feeReceipt: formData.feeReceipt }, { isDelete: false }, { _id: { $ne: id } }] }).then(existingFeeReceipt => {
              //         if (existingFeeReceipt != null)
              //             isValidated = false
              //     })
              // }
              res.updatedAt = new Date();
              // if (isValidated) {
              res.save()
                .then(res => {
                  {
                    resolve({
                      status: 200,
                      success: true,
                      message: "FeeReceipt Updated Successfully",
                      data: res
                    })
                  }
                })
                .catch(next)
              // } else {
              //     reject("FeeReceipt already exists")
              // }
            }

          })
          .catch(next)
      }
      else {
        reject("Id Format is Wrong");
      }
    }
    else {
      reject("Please enter an _id to Proceed");
    }
  });

}
async function deleteFeeReceipt(req, res, next) {
  await deleteFeeReceiptFun(req).then(next).catch(next);
};
function deleteFeeReceiptFun(req, next) {
  let formData = req.body
  return new Promise((resolve, reject) => {
    if (formData != undefined && formData._id != undefined) {
      FeeReceipt.findOne({ "_id": formData._id })
        .then(async res => {
          if (!res)
            reject("FeeReceipt not found");
          else {

            //START:  to check the receipt is latest and not 7 days old
            let isWithinLast7Days= moment.utc(res.createdAt).isAfter(moment.utc().subtract(7, 'days'));
            /// hit to DB for check lastest receipts
            let receipt =await FeeReceipt.countDocuments({$and:[
              {createdAt:{$gt: moment.utc(res.createdAt)}},
              {isDelete:false}
            ]});
            if(!isWithinLast7Days) {
              let message ="";
              if(!isSevenDaysOld) message = message + "Not Deleted!! This receipt is more then 7 days old";
               reject(message);
               return;
            }
            if (receipt>0) {
              message = "";
              if( receipt > 0)  message = message + "Not Deleted!!. This is not a latest receipt.";
              reject(message);
              return;
            }

            // END: to check the receipt is latest and not 7 days old
            res.isDelete = true
            res.updatedAt = new Date();
            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
            res.save()
              .then(async res => {
                {
                  let calculateFeeData = await CalculateFee.findOne({ _id: res.calculateFeeId }).exec()
                  if (!!calculateFeeData) {
                    if (res.isRegistrationSlip) {

                      calculateFeeData.isRegistrationFeePending = true
                      calculateFeeData.registrationFeePaid -= res.amountPaid
                      calculateFeeData.registrationFeePending += res.amountPaid
                      calculateFeeData.pendingRegistraionPaidAt = null
                      calculateFeeData.nextInstallment=0;
                    }
                    else {
                      let installmentObj = calculateFeeData.installments[parseInt(res.installmentNumber) - 1]
                      // calculateFeeData.totalBalance += res.amountPaid
                      console.log(installmentObj);

                      if (installmentObj.balancePayments.length <= 1) {
                        if (installmentObj.balancePayments.length == 1 && installmentObj.balancePayments[0].paidAmount != null) {
                          installmentObj.balancePayments[0].paidAmount = null
                          installmentObj.balancePayments[0].paidAt = null
                          installmentObj.balancePayments[0].collectedBy = null
                          installmentObj.isBalancePending = true
                          installmentObj.balance += res.amountPaid
                        }
                        else {

                          // if (installmentObj.balance == 0)
                          //   calculateFeeData.nextInstallment--

                          installmentObj.paidAmount = 0
                          installmentObj.createdAt = null
                          installmentObj.collectedBy = null
                          installmentObj.paidAt = null
                          installmentObj.isBalancePending = null
                          installmentObj.balance = null
                          installmentObj.balancePayments = []
                        }
                      }
                      else {
                        let total = installmentObj.balancePayments.length
                        if (total > 1) {
                          if (installmentObj.isBalancePending == false) calculateFeeData.nextInstallment--

                          installmentObj.balancePayments[total - 1].paidAmount = null
                          installmentObj.balancePayments[total - 1].paidAt = null
                          installmentObj.balancePayments[total - 1].collectedBy = null
                          installmentObj.isBalancePending = true
                          installmentObj.balance += res.amountPaid
                        }
                      }
                      calculateFeeData.installments[parseInt(res.installmentNumber) - 1] = installmentObj


                      // if the receipt is deleted, the mention installment number
                      // will be assignmed to next installment
                      // bcz only latest numbered receipt will be deleted
                      calculateFeeData.nextInstallment = parseInt(res.installmentNumber);
                      console.log(calculateFeeData.nextInstallment);
                    }

                    calculateFeeData.totalFeePaid -= res.amountPaid,
                    calculateFeeData.totalBalance += res.amountPaid,
                    calculateFeeData.isTotalFeePaid = false



                    calculateFeeData.save()
                      .then((feeData) => {
                        Admission.findOne({ _id: res.admissionId }).exec()
                          .then((admissionData) => {
                            admissionData.isTotalFeePaid = false
                            admissionData.save()
                              .then((res) => {
                                resolve({
                                  status: 200,
                                  success: true,
                                  message: "FeeReceipt deleted Successfully"
                                })
                              })
                              .catch(next)
                          })
                          .catch(next)
                      })
                      .catch(next)

                  }
                  else {
                    reject({ status: 422, success: false, message: "FeeData not Found" })
                  }

                }
              })
              .catch(next)
          }
        })
        .catch(next)
    }
    else {
      reject("Please enter an _id to Proceed");
    }
  });

}
