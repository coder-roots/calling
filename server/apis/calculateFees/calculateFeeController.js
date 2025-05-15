const CalculateFee = require('./calculateFeeModel')
const SessionYear = require('../sessionYear/sessionYearModel')
const Enquiry = require('../enquiry/enquiryModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')

module.exports = {
    index,
    calculateFee,
    recalculateFee,
    fetchCalculatedFeeByEnquiryId,
    fetchCalculatedFeeByAdmissionId
}

async function index(req, res, next) {
    await indexFun(req, next).then(next).catch(next);
};
function indexFun(req, next) {
    return new Promise((resolve, reject) => {
        var lim = 100000;
        var skip1 = 0;
        let formData = {}
        if (req.body != undefined)
            formData = req.body
        else formData = req
        formData.isDelete = false
        if (formData.startpoint != undefined) {
            skip1 = parseInt(formData.startpoint)
            lim = 10;
            delete formData.startpoint
        }
        // if(!!formData.startDate && !!formData.endDate){
        //     let start =new Date(formData.startDate)
        //     start.setHours(0,0,0,0)
        //     let end =new Date(formData.endDate)
        //     end.setHours(23,59,59,999)
        //     formData.updatedAt = {$gt:start, $lt:end}
        //     delete formData.startDate
        //     delete formData.endDate
        // }

        if (req.headers != undefined && req.headers.sessionyearid != undefined && db.isValid(req.headers.sessionyearid)) {
            formData.sessionYearId = req.headers.sessionyearid
        }
        var find = { $and: [formData] }

        CalculateFee.find(find)
            .populate({ path: 'admissionId', populate: 'studentId college technologies.course' })
            .exec()
            .then(async alldocuments => {
                var total = 0
                total = await CalculateFee.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All Fee Calculation Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}

async function calculateFee(req, res, next) {
    await calculateFeeFun(req, next).then(next).catch(next);
}
function calculateFeeFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        const createSchema = Joi.object().keys({
            enquiryId: Joi.string().required(),
            discount: Joi.any().required(),
            totalFeesApplicable: Joi.any().required(),
            totalFeeToBePaid: Joi.any().required(),
            totalRegistrationFee: Joi.any().required(),
            registrationFeePaid: Joi.any().required(),
            totalInstallments: Joi.any().required(),
            courseStartDate: Joi.date().required()
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
            let prev = await CalculateFee.findOne({ enquiryId: formData.enquiryId })

            if (prev == null) {
                CalculateFee.countDocuments()
                    .then(total => {
                        let feeObj = new CalculateFee()
                        feeObj.calculateFeeAutoId = total + 1
                        feeObj.enquiryId = formData.enquiryId
                        feeObj.totalFeesApplicable = formData.totalFeesApplicable
                        feeObj.totalFeeToBePaid = formData.totalFeeToBePaid
                        feeObj.discount = formData.discount
                        feeObj.totalFeePaid = formData.registrationFeePaid
                        feeObj.totalBalance = formData.totalFeeToBePaid - formData.registrationFeePaid
                        feeObj.totalInstallments = formData.totalInstallments
                        feeObj.courseStartDate = formData.courseStartDate
                        feeObj.totalBalance = formData.totalFeeToBePaid - formData.registrationFeePaid

                        feeObj.registrationFeePayable = formData.totalRegistrationFee
                        feeObj.registrationFeePaid = formData.registrationFeePaid

                        if (formData.registrationFeePaid < formData.totalRegistrationFee) {
                            feeObj.registrationFeePending = formData.totalRegistrationFee - formData.registrationFeePaid
                            feeObj.isRegistrationFeePending = true
                            feeObj.nextInstallment = 0
                            feeObj.isTotalFeePaid = false
                        }
                        else {
                            feeObj.registrationFeePending = 0
                            feeObj.isRegistrationFeePending = false
                            feeObj.nextInstallment = 1
                            feeObj.isTotalFeePaid = false
                        }

                        if (formData.totalFeeToBePaid == formData.registrationFeePaid) {
                            feeObj.nextInstallment = -1
                            feeObj.isTotalFeePaid = true
                        }

                        feeObj.courseStartDate = formData.courseStartDate
                        feeObj.totalInstallments = formData.totalInstallments


                        if (typeof formData.installments == 'string')
                            feeObj.installments = JSON.parse(formData.installments)
                        else feeObj.installments = formData.installments

                        console.log(feeObj.installments);

                        if (!!req.headers.sessionyearid) feeObj.sessionYearId = req.headers.sessionyearid
                        if (req.decoded.addedById) feeObj.addedById = req.decoded.addedById


                        feeObj.save()
                            .then(saveRes => {
                                Enquiry.updateOne({ _id: formData.enquiryId }, { $set: { isFeeCalculated: true } }).exec().then(() => {
                                    resolve({
                                        status: 200, success: true, message: "Fee Saved", data: saveRes
                                    })
                                }).catch(err => {
                                    reject({ success: false, status: 500, message: err })
                                })

                            }).catch(err => {
                                reject({ success: false, status: 500, message: err.message })
                            })


                    })
            }
            else {

                prev.totalFeesApplicable = formData.totalFeesApplicable
                prev.totalFeeToBePaid = formData.totalFeeToBePaid
                prev.discount = formData.discount
                prev.totalFeePaid = formData.registrationFeePaid //
                prev.totalBalance = formData.totalFeeToBePaid - formData.registrationFeePaid //
                prev.totalInstallments = formData.totalInstallments
                prev.courseStartDate = formData.courseStartDate
                prev.totalBalance = formData.totalFeeToBePaid - formData.registrationFeePaid

                prev.registrationFeePayable = formData.totalRegistrationFee
                prev.registrationFeePaid = formData.registrationFeePaid

                if (formData.registrationFeePaid < formData.totalRegistrationFee) {
                    prev.registrationFeePending = formData.totalRegistrationFee - formData.registrationFeePaid
                    prev.isRegistrationFeePending = true
                    prev.nextInstallment = 0
                    prev.isTotalFeePaid = false
                }
                else {
                    prev.registrationFeePending = 0
                    prev.isRegistrationFeePending = false
                    prev.nextInstallment = 1
                    prev.isTotalFeePaid = false
                }

                if (formData.totalFeeToBePaid == formData.registrationFeePaid) {
                    prev.nextInstallment = -1
                    prev.isTotalFeePaid = true
                }

                prev.courseStartDate = formData.courseStartDate
                prev.totalInstallments = formData.totalInstallments


                if (typeof formData.installments == 'string')
                    prev.installments = JSON.parse(formData.installments)
                else prev.installments = formData.installments



                if (req.decoded.updatedById) prev.updatedById = req.decoded.updatedById


                prev.save()
                    .then(saveRes => {
                        resolve({
                            status: 200, success: true, message: "Fee Saved", data: saveRes
                        })
                    }).catch(err => {
                        reject({ success: false, status: 500, message: err.message })
                    })
            }
        }

    })
}


async function fetchCalculatedFeeByEnquiryId(req, res, next) {
    await fetchCalculatedFeeByEnquiryIdFun(req, next).then(next).catch(next);
};
function fetchCalculatedFeeByEnquiryIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData.enquiryId != undefined) {
            if (db.isValid(formData.enquiryId)) {
                var finder = { $and: [formData] };
                CalculateFee.findOne(finder)
                    // .populate('enquiryId')
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Fee Data Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("Fee Data not found");
                        }
                    })
                    .catch(next)
            }
            else {
                reject("Id Format is Wrong")
            }
        }
        else {
            resolve("Please enter enquiryId to Proceed ");
        }
    })
}

async function fetchCalculatedFeeByAdmissionId(req, res, next) {
    await fetchCalculatedFeeByAdmissionIdFun(req, next).then(next).catch(next);
};
function fetchCalculatedFeeByAdmissionIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData.admissionId != undefined) {
            if (db.isValid(formData.admissionId)) {
                var finder = { $and: [formData] };
                CalculateFee.findOne(finder)
                    .populate('installments.collectedBy')
                    // .populate('studentId')
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Fee Data Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("Fee Data not found");
                        }
                    })
                    .catch(next)
            }
            else {
                reject("Id Format is Wrong")
            }
        }
        else {
            resolve("Please enter admissionId to Proceed ");
        }
    })
}

async function recalculateFee(req, res, next) {
    await recalculateFeeFun(req, next).then(next).catch(next);
}
function recalculateFeeFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        const createSchema = Joi.object().keys({
            _id: Joi.string().required(),
            enquiryId: Joi.string().required(),
            discount: Joi.any().required(),
            totalRegistrationFee: Joi.any().required(),
            registrationFeePaid: Joi.any().required(),
            totalInstallments: Joi.any().required(),
            courseStartDate: Joi.date().required()
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
            let prev = await CalculateFee.findOne({ enquiryId: formData._id })
            if (prev == null) {
                reject({ success: false, status: 500, message: "Fee object does not Exists" })

            }
            else {
                CalculateFee.countDocuments()
                    .then(total => {
                        var feeObj = CalculateFee()
                        feeObj.calculateFeeAutoId = total + 1
                        feeObj.enquiryId = formData.enquiryId
                        feeObj.discount = formData.discount
                        feeObj.totalRegistrationFee = formData.totalRegistrationFee
                        feeObj.registrationFeePaid = formData.registrationFeePaid
                        feeObj.totalInstallments = formData.totalInstallments
                        feeObj.courseStartDate = formData.courseStartDate
                        if (req.decoded.addedById) feeObj.addedById = req.decoded.addedById

                        Enquiry.findOne({ _id: formData.enquiryId })
                            .populate({ path: 'technologies.course' })
                            .exec()
                            .then((enquiry) => {
                                if (enquiry == null) {
                                    reject({ success: false, status: 500, message: "No Enquiry Data Found" })
                                }
                                else {
                                    let totalFee = 0
                                    for (let i = 0; i < enquiry.technologies.length; i++) {
                                        const element = enquiry.technologies[i];
                                        totalFee += element.course.fee
                                    }
                                    feeObj.totalFeesApplicable = totalFee
                                    feeObj.totalFeeToBePaid = totalFee - feeObj.discount

                                    feeObj.pendingRegistrationFee = feeObj.totalRegistrationFee - feeObj.registrationFeePaid

                                    let installmentFee = feeObj.totalFeeToBePaid - feeObj.totalRegistrationFee
                                    let installmentFeePerMonth = installmentFee / feeObj.totalInstallments
                                    let m = feeObj.courseStartDate.getMonth() + 2
                                    if (m > 12) m -= 12
                                    let installments = []
                                    for (let i = 0; i < feeObj.totalInstallments; i++) {
                                        if (m > 12) m -= 12
                                        let Obj = {
                                            month: m++,
                                            amountToBePaid: installmentFeePerMonth
                                        }
                                        installments.push(Obj)

                                    }
                                    feeObj.installments = installments
                                    console.log(feeObj);

                                    feeObj.save()
                                        .then(saveRes => {
                                            Enquiry.updateOne({ _id: formData.enquiryId }, { $set: { isFeeCalculated: true } }).exec().then(() => {
                                                resolve({
                                                    status: 200, success: true, message: "Fee Calculated", data: saveRes
                                                })
                                            }).catch(err => {
                                                reject({ success: false, status: 500, message: err })
                                            })

                                        }).catch(err => {
                                            reject({ success: false, status: 500, message: err.message })
                                        })
                                }
                            })
                            .catch(err => {
                                reject({ success: false, status: 500, message: err.message })
                            })

                    })


            }
        }
    })
}
