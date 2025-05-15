const Admission = require('./admissionModel')
const SessionYear = require('../sessionYear/sessionYearModel')
const Enquiry = require('../enquiry/enquiryModel')
const Student = require('../student/studentModel')
const CalculateFee = require('../calculateFees/calculateFeeModel')
const PrevCalculateFee = require('../prevCalculateFee/prevCalculateFeeModel')
const FeeReceipt = require('../feeReceipt/feeReceiptModel')
const Course = require('../course/courseModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')
const mongoose = require('mongoose')
const { ObjectId } = require('mongodb');
const { log } = require('console')

module.exports = {
    index,
    fetchAdmissionById,
    confirmAdmission,
    addAdmission,
    updateAdmission,
    deleteAdmission,
    changeCourse,
    dropAdmission,
    dropAdmissionList,
    updateDetailAdmission
}
async function index(req, res, next) {
    await indexFun(req, next).then(next).catch(next);
};


function indexFun(req, next) {
    return new Promise(async (resolve, reject) => {
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
        // if (!!formData.admissionAutoId)
        // delete formData.admissionAutoId
        // console.log("formData: ", formData)
        if (!!formData.startDate && !!formData.endDate) {
            let start = new Date(formData.startDate)
            start.setHours(0, 0, 0, 0)
            let end = new Date(formData.endDate)
            end.setHours(23, 59, 59, 999)
            formData.admissionDate = { $gt: start, $lt: end }
            delete formData.startDate
            delete formData.endDate
        }

        if (req.headers != undefined && req.headers.sessionyearid != undefined && db.isValid(req.headers.sessionyearid)) {
            formData.sessionYearId = req.headers.sessionyearid
        }
        if (!!formData.removeSession && formData.removeSession == 'true') {
            delete formData.sessionYearId
        }

        let find = { $and: [] };
        // console.log("find", find.admissionDate)
        if (formData.search) {
            const searchRegex = new RegExp(formData.search, 'i');
            const students = await Student.find({
                $or: [
                    { studentName: searchRegex },
                    { email: searchRegex }
                ]
            }).select('_id');

            const studentIds = students.map(student => student._id);
            // console.log("studentIds", studentIds)
            find.$and.push({ studentId: { $in: studentIds } });
            delete formData.search;
        }
        find.$and.push(formData)
        // console.log(find)
        Admission.find(find)
            .skip(skip1)
            .limit(lim)
            .populate('technologies')
            .populate('college')
            .populate('studentId')
            .populate('managementPersonId')
            .populate({ path: 'technologies.course' })
            .populate({ path: 'technologies.enquiryTakenBy' })
            .populate({ path: 'batches.batchId', populate: 'employeeId technology labId timeSlotId' })
            .sort({ admissionDate: -1 })
            .exec()
            .then(async alldocuments => {
                var total = 0
                total = await Admission.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All Admissions Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}

async function confirmAdmission(req, res, next) {
    await confirmAdmissionFun(req).then(next).catch(next);
};
function confirmAdmissionFun(req, next) {
    // let isValidated = true
    return new Promise(async (resolve, reject) => {
        // console.log(req.body);
        let formData = req.body
        const createSchema = Joi.object().keys({
            _id: Joi.string().required(),
            paymentMethod: Joi.string().required(),
            collectedOn: Joi.any().required(),
            collectedBy: Joi.any().required(),
            remarks: Joi.any().required(),
            technologies: Joi.any().required(),
            receiptType: Joi.any().optional(),
            manualReceiptNumber: Joi.any().optional(),
        })
        const result = createSchema.validate(formData)
        const { value, error } = result
        const valid = error == null
        if (!valid) {
            const { details } = error;
            reject({
                status: 400,
                success: false,
                message: details.map(i => i.message).join(',')
            });
        } else {
            let technologies = formData.technologies
            let session = await SessionYear.findOne({ isActive: true })

            Enquiry.findOne({ "_id": formData._id })

                .then(async res => {
                    if (!res)
                        reject("Enquiry not found");
                    else {
                        res.isAdmissionConfirmed = true
                        res.save()
                            .then(async res => {
                                {
                                    var studentId = ''
                                    if (res.isNewStudent) {
                                        let total = await Student.countDocuments()
                                        let student = new Student()
                                        student.studentAutoId = total + 1
                                        student.studentName = res.studentName
                                        student.email = res.email
                                        student.personalContact = res.personalContact
                                        student.parentsContact = res.parentsContact
                                        student.company = res.company;
                                        if (!!session && !!req.headers.sessionyearid) student.sessionYearId = session._id
                                        await student.save()
                                            .then(studentData => {
                                                studentId = studentData._id
                                            })
                                            .catch(next)
                                    }
                                    else {
                                        studentId = res.studentId
                                    }
                                    let total = await Admission.countDocuments()
                                    let admission = new Admission()
                                    admission.admissionAutoId = total + 1
                                    admission.enquiryId = res._id
                                    admission.isNewStudent = res.isNewStudent
                                    admission.studentId = studentId
                                    admission.isOfficialTraining = res.isOfficialTraining
                                    admission.trainingType = res.trainingType
                                    admission.isPassout = res.isPassout
                                    admission.college = res.college
                                    admission.collegeCourse = res.collegeCourse
                                    admission.semester = res.semester
                                    admission.managementPersonId = res.managementPersonId
                                    admission.technologies = technologies
                                    admission.comments = res.comments
                                    admission.isFeeCalculated = true
                                    admission.company = res.company;
                                    if (!!session && !!req.headers.sessionyearid) admission.sessionYearId = session._id
                                    admission.save()
                                        .then(async admissionData => {
                                            let calculateFee = await CalculateFee.findOne({ enquiryId: res._id })
                                            calculateFee.isEnquiryFee = false
                                            calculateFee.admissionId = admissionData._id
                                            if (!!session && !!req.headers.sessionyearid) calculateFee.sessionYearId = session._id

                                            if (calculateFee.totalFeeToBePaid == calculateFee.registrationFeePaid && calculateFee.totalInstallments == 0) {
                                                admissionData.isTotalFeePaid = true
                                                await admissionData.save()
                                            }

                                            calculateFee.save()
                                                .then(async calculateFeeData => {

                                                    let feeReceiptTotal = await FeeReceipt.countDocuments()
                                                    let feeReceipt = new FeeReceipt()
                                                    feeReceipt.feeReceiptAutoId = feeReceiptTotal + 1
                                                    feeReceipt.isRegistrationSlip = true
                                                    feeReceipt.calculateFeeId = calculateFeeData._id
                                                    feeReceipt.admissionId = admissionData._id
                                                    feeReceipt.amountPaid = calculateFeeData.registrationFeePaid
                                                    feeReceipt.paymentMethod = formData.paymentMethod
                                                    if (!!formData.collectedOn) feeReceipt.collectedOn = formData.collectedOn
                                                    feeReceipt.collectedBy = formData.collectedBy
                                                    if (!!formData.remarks) feeReceipt.remarks = formData.remarks
                                                    if (req.decoded.addedById) feeReceipt.addedById = req.decoded.addedById
                                                    if (!!session && !!req.headers.sessionyearid) feeReceipt.sessionYearId = session._id


                                                    feeReceipt.receiptType = formData.receiptType
                                                    feeReceipt.company = res.company;

                                                    // if receipt is manual receipt
                                                    if (feeReceipt.receiptType == 1) {
                                                        feeReceipt.manualReceiptNumber = formData.manualReceiptNumber
                                                    }

                                                    feeReceipt.save()
                                                        .then(() => {
                                                            resolve({
                                                                status: 200,
                                                                success: true,
                                                                message: "Admission Confirmed",
                                                                data: admissionData
                                                            })
                                                        })
                                                        .catch()
                                                })
                                                .catch(next)

                                        })
                                        .catch(next)

                                }
                            })
                            .catch(next)

                    }

                })
                .catch(next)
        }



    });

}

async function addAdmission(req, res, next) {
    await addAdmissionFun(req, next).then(next).catch(next);
}
function addAdmissionFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        // console.log(typeof formData.courses);
        const createSchema = Joi.object().keys({
            isNewStudent: Joi.boolean().required(),
            studentId: Joi.any().required(),
            technologies: Joi.any().required(),
            isOfficialTraining: Joi.boolean().required(),
            trainingType: Joi.any(),
            isPassout: Joi.any(),
            college: Joi.string().required(),
            collegeCourse: Joi.string().required(),
            semester: Joi.any(),
            comments: Joi.any(),
            managementPersonId: Joi.string().required(),
            totalFeesApplicable: Joi.any().required(),
            discount: Joi.any().required(),
            totalFeeToBePaid: Joi.any().required(),
            totalRegistrationFee: Joi.any().required(),
            registrationFeePaid: Joi.any().required(),
            paymentMethod: Joi.any().required(),
            remarks: Joi.any(),
            totalInstallments: Joi.number().required(),
            courseStartDate: Joi.date().required(),
            installments: Joi.any().required(),
            company: Joi.any().required(),
            admissionDate: Joi.any()
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
            let session = await SessionYear.findOne({ isActive: true })
            // console.log(formData);
            if (formData.isNewStudent) {
                var studentId;
                let existingStudent = await Student.findOne({ email: formData.email, isDelete: false })
                if (existingStudent == null) {
                    let total = await Student.countDocuments()
                    let student = new Student()
                    student.studentAutoId = total + 1
                    if (!!formData.studentName) student.studentName = formData.studentName
                    if (!!formData.email) student.email = formData.email
                    if (!!formData.personalContact) student.personalContact = formData.personalContact
                    if (!!formData.parentsContact) student.parentsContact = formData.parentsContact
                    if (!!formData.college) student.college = formData.college
                    if (!!formData.company) student.company = formData.company
                    if (!!formData.collegeCourse) student.collegeCourse = formData.collegeCourse
                    if (!!session && !!req.headers.sessionyearid) student.sessionYearId = session._id

                    await student.save()
                        .then(studentData => {
                            studentId = studentData._id

                        })
                        .catch(next)
                }
                else {
                    studentId = existingStudent._id
                    formData.isNewStudent = false
                }
            }
            else {
                studentId = formData.studentId
            }

            // if(){
            Admission.countDocuments()
                .then(total => {
                    var admission = Admission()
                    admission.admissionAutoId = total + 1
                    admission.isDirectAdmission = true
                    admission.studentId = studentId
                    admission.isNewStudent = formData.isNewStudent

                    if (typeof formData.technologies == 'string')
                        admission.technologies = JSON.parse(formData.technologies)
                    else admission.technologies = formData.technologies

                    admission.managementPersonId = formData.managementPersonId
                    admission.isOfficialTraining = formData.isOfficialTraining
                    if (!!formData.trainingType) admission.trainingType = formData.trainingType
                    if (!!formData.isPassout) admission.isPassout = formData.isPassout
                    if (!!formData.college) admission.college = formData.college
                    if (!!formData.collegeCourse) admission.collegeCourse = formData.collegeCourse
                    if (!!formData.semester) admission.semester = formData.semester
                    if (!!formData.company) admission.company = formData.company

                    if (!!formData.comments) admission.comments = formData.comments
                    if (!!formData.admissionDate) admission.admissionDate = formData.admissionDate
                    admission.isFeeCalculated = true

                    if (formData.totalFeeToBePaid == formData.registrationFeePaid && formData.totalInstallments == 0) {
                        admission.isTotalFeePaid = true
                    }

                    if (!!session && !!req.headers.sessionyearid) admission.sessionYearId = session._id
                    if (req.decoded.addedById) admission.addedById = req.decoded.addedById

                    admission.save()
                        .then(async savedAdmission => {
                            let calculateFeeTotal = await CalculateFee.countDocuments()
                            let calculateFee = new CalculateFee()
                            calculateFee.calculateFeeAutoId = calculateFeeTotal + 1
                            calculateFee.isEnquiryFee = false,
                                calculateFee.admissionId = savedAdmission._id
                            calculateFee.totalFeesApplicable = formData.totalFeesApplicable
                            calculateFee.discount = formData.discount
                            calculateFee.totalFeeToBePaid = formData.totalFeeToBePaid
                            calculateFee.totalFeePaid = formData.registrationFeePaid
                            calculateFee.totalBalance = formData.totalFeeToBePaid - formData.registrationFeePaid

                            calculateFee.registrationFeePayable = formData.totalRegistrationFee
                            calculateFee.registrationFeePaid = formData.registrationFeePaid
                            if (formData.registrationFeePaid < formData.totalRegistrationFee) {
                                calculateFee.registrationFeePending = formData.totalRegistrationFee - formData.registrationFeePaid
                                calculateFee.isRegistrationFeePending = true
                                calculateFee.nextInstallment = 0
                            }
                            else {
                                calculateFee.registrationFeePending = 0
                                calculateFee.isRegistrationFeePending = false
                                calculateFee.nextInstallment = 1
                            }

                            if (formData.totalFeeToBePaid == formData.registrationFeePaid) {
                                calculateFee.nextInstallment = -1
                                calculateFee.isTotalFeePaid = true
                            }

                            calculateFee.courseStartDate = formData.courseStartDate
                            calculateFee.totalInstallments = formData.totalInstallments
                            if (typeof formData.installments == 'string')
                                calculateFee.installments = JSON.parse(formData.installments)
                            else calculateFee.installments = formData.installments


                            if (!!session && !!req.headers.sessionyearid) calculateFee.sessionYearId = session._id
                            if (req.decoded.addedById) calculateFee.addedById = req.decoded.addedById
                            calculateFee.save()
                                .then(async (savedCalculatedFee) => {
                                    let feeReceiptTotal = await FeeReceipt.countDocuments()
                                    let feeReceipt = new FeeReceipt()
                                    feeReceipt.feeReceiptAutoId = feeReceiptTotal + 1
                                    feeReceipt.isRegistrationSlip = true
                                    feeReceipt.calculateFeeId = savedCalculatedFee._id
                                    feeReceipt.admissionId = savedAdmission._id
                                    feeReceipt.amountPaid = formData.registrationFeePaid
                                    feeReceipt.paymentMethod = formData.paymentMethod
                                    if (!!formData.admissionDate) feeReceipt.collectedOn = formData.admissionDate
                                    feeReceipt.collectedBy = formData.collectedBy ?? ""
                                    if (!!formData.remarks) feeReceipt.remarks = formData.remarks
                                    if (req.decoded.addedById) feeReceipt.addedById = req.decoded.addedById
                                    if (!!session && !!req.headers.sessionyearid) feeReceipt.sessionYearId = session._id
                                    if (!!formData.company) feeReceipt.company = formData.company
                                    if (formData.receiptType != undefined && formData.receiptType != null) feeReceipt.receiptType = formData.receiptType
                                    if (formData.manualReceiptNumber != undefined && formData.manualReceiptNumber != null) feeReceipt.manualReceiptNumber = formData.manualReceiptNumber
                                    // if (!!formData.company) feeReceipt.company = formData.company

                                    feeReceipt.save()
                                        .then(savedFeeReceipt => {
                                            resolve({
                                                status: 200, success: true, message: "Admission added successfully.", data: savedAdmission
                                            })
                                        })
                                        .catch(next)
                                })
                                .catch(next)
                        }).catch(next)
                })
            // }

        }
    })
}

async function fetchAdmissionById(req, res, next) {
    await fetchAdmissionByIdFun(req, next).then(next).catch(next);
};
function fetchAdmissionByIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                var finder = { $and: [formData] };
                Admission.findOne(finder)
                    .populate('studentId')
                    .populate('college', 'name')
                    .populate({ path: 'technologies.course' })
                    .populate({ path: 'changeCourseLogs.prevTechnologies.course' })
                    .populate({ path: 'technologies.enquiryTakenBy' })
                    .populate('managementPersonId')
                    .populate({ path: 'batches.batchId', populate: 'technology timeSlotId labId employeeId' })
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Single Admission Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("Admission not found");
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

async function updateAdmission(req, res, next) {
    await updateAdmissionFun(req).then(next).catch(next);
};
function updateAdmissionFun(req, next) {

    // console.log(req.body);
    let formData = req.body
    let isValidated = true
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                Admission.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("Admission not found");
                        else {
                            if (!!formData.isNewStudent) res.isNewStudent = formData.isNewStudent
                            if (!!formData.studentId) res.studentId = formData.studentId
                            if (!!formData.isOfficialTraining) res.isOfficialTraining = formData.isOfficialTraining
                            if (!formData.isOfficialTraining) res.isOfficialTraining = false
                            if (!!formData.trainingType) res.trainingType = formData.trainingType

                            if (!!formData.isPassout) res.isPassout = formData.isPassout
                            if (!!formData.college) res.college = formData.college
                            if (!!formData.collegeCourse) res.collegeCourse = formData.collegeCourse
                            if (!!formData.semester) res.semester = formData.semester
                            if (!!formData.managementPersonId) res.managementPersonId = formData.managementPersonId
                            if (!!formData.technologies) {
                                if (typeof formData.technologies == 'string') {
                                    res.technologies = JSON.parse(formData.technologies)
                                }
                                else res.technologies = formData.technologies
                            }
                            if (!!formData.comments) res.comments = formData.comments
                            if (!!formData.isActive) res.isActive = formData.isActive
                            if (!!formData.admissionDate) res.admissionDate = formData.admissionDate

                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                            // let id = res._id
                            // if (!!formData.email) {
                            //     await Admission.findOne({ $and: [{ email: formData.email }, { isDelete: false }, { _id: { $ne: id } }] }).then(existingAdmission => {
                            //         if (existingAdmission != null)
                            //             isValidated = false
                            //     })
                            // }
                            res.updatedAt = new Date();
                            res.save()
                                .then(async res => {
                                    {
                                        let student = await Student.findOne({ _id: res.studentId })
                                        if (!!formData.studentName) student.studentName = formData.studentName
                                        if (!!formData.email) student.email = formData.email
                                        if (!!formData.parentsContact) student.parentsContact = formData.parentsContact
                                        if (!!formData.personalContact) student.personalContact = formData.personalContact
                                        await student.save()
                                            .then(() => { })
                                            .catch(next)

                                        let calculateFee = await CalculateFee.findOne({ admissionId: res._id }).exec()
                                        if (!!formData.totalFeesApplicable) calculateFee.totalFeesApplicable = formData.totalFeesApplicable
                                        if (!!formData.discount) calculateFee.discount = formData.discount
                                        if (!!formData.totalFeeToBePaid) calculateFee.totalFeeToBePaid = formData.totalFeeToBePaid
                                        if (!!formData.registrationFeePaid) calculateFee.registrationFeePaid = formData.registrationFeePaid
                                        if (!!formData.courseStartDate) calculateFee.courseStartDate = formData.courseStartDate
                                        if (!!formData.totalInstallments) calculateFee.totalInstallments = formData.totalInstallments
                                        if (!!formData.installments) {
                                            if (typeof formData.installments == 'string')
                                                calculateFee.installments = JSON.parse(formData.installments)
                                            else calculateFee.installments = formData.installments
                                        }
                                        let sum = calculateFee.registrationFeePaid
                                        for (let x of calculateFee.installments) {
                                            sum += x.paidAmount
                                        }
                                        calculateFee.totalBalance = calculateFee.totalFeeToBePaid - sum
                                        calculateFee.save().then(() => {
                                            resolve({
                                                status: 200,
                                                success: true,
                                                message: "Admission Updated Successfully",
                                                data: res
                                            })
                                        })
                                            .catch(next)
                                    }
                                })
                                .catch(next)
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

async function updateDetailAdmission(req, res, next) {
    await updateDetailAdmissionFun(req).then(next).catch(next);
};
function updateDetailAdmissionFun(req, next) {

    // console.log(req.body);
    let formData = req.body
    let isValidated = true
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                Admission.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("Admission not found");
                        else {
                            if (!!formData.isNewStudent) res.isNewStudent = formData.isNewStudent
                            if (!!formData.studentId) res.studentId = formData.studentId
                            if (!!formData.isOfficialTraining) res.isOfficialTraining = formData.isOfficialTraining
                            if (!formData.isOfficialTraining) res.isOfficialTraining = false
                            if (!!formData.trainingType) res.trainingType = formData.trainingType

                            if (!!formData.isPassout) res.isPassout = formData.isPassout
                            if (!!formData.college) res.college = formData.college
                            if (!!formData.collegeCourse) res.collegeCourse = formData.collegeCourse
                            if (!!formData.semester) res.semester = formData.semester
                            if (!!formData.company) res.company = formData.company
                            if (!!formData.managementPersonId) res.managementPersonId = formData.managementPersonId
                            if (!!formData.technologies) {
                                if (typeof formData.technologies == 'string') {
                                    res.technologies = JSON.parse(formData.technologies)
                                }
                                else res.technologies = formData.technologies
                            }
                            if (!!formData.comments) res.comments = formData.comments
                            if (!!formData.isActive) res.isActive = formData.isActive
                            if (!!formData.admissionDate) res.admissionDate = formData.admissionDate

                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById

                            res.updatedAt = new Date();
                            res.save()
                                .then(async res => {
                                    {
                                        let student = await Student.findOne({ _id: res.studentId })
                                        if (!!formData.studentName) student.studentName = formData.studentName
                                        if (!!formData.email) student.email = formData.email
                                        if (!!formData.company) student.company = formData.company
                                        if (!!formData.parentsContact) student.parentsContact = formData.parentsContact
                                        if (!!formData.personalContact) student.personalContact = formData.personalContact
                                        await student.save()
                                            .then(() => {
                                                resolve({
                                                    status: 200,
                                                    success: true,
                                                    message: "Admission Updated Successfully",
                                                    data: res
                                                })
                                            })
                                            .catch(next)
                                    }
                                })
                                .catch(next)
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

async function deleteAdmission(req, res, next) {
    await deleteAdmissionFun(req).then(next).catch(next);
};
function deleteAdmissionFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            Admission.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("Admission not found");
                    else {
                        res.isDelete = true
                        res.updatedAt = new Date();
                        if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                        res.save()
                            .then(res => {
                                {
                                    CalculateFee.findOne({ admissionId: formData._id }).then((feeRes) => {
                                        if (!feeRes) {
                                            reject("Fee Data not found")
                                        }
                                        else {
                                            feeRes.isDelete = true
                                            feeRes.updatedAt = new Date();
                                            if (!!req.decoded.updatedById) feeRes.updatedById = req.decoded.updatedById
                                            feeRes.save()
                                                .then(() => {
                                                    FeeReceipt.updateMany({ admissionId: formData._id }, {
                                                        $set: { isDelete: true }
                                                    })
                                                        .then(() => {
                                                            resolve({
                                                                status: 200,
                                                                success: true,
                                                                message: "Admission deleted Successfully"
                                                            })
                                                        })
                                                }).catch(next)

                                        }
                                    })
                                        .catch(next)
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


async function changeCourse(req, res, next) {
    await changeCourseFun(req).then(next).catch(next);
};
function changeCourseFun(req, next) {


    // let isValidated = true
    return new Promise((resolve, reject) => {
        // console.log(req.body);
        let formData = req.body
        const createSchema = Joi.object().keys({
            admissionId: Joi.string().required(),
            technologies: Joi.any().required(),
            totalFeesApplicable: Joi.any().required(),
            discount: Joi.any().required(),
            totalFeeToBePaid: Joi.any().required(),
            totalFeePaid: Joi.any().required(),
            totalBalance: Joi.any().required(),
            extra: Joi.any(),
            isRegistrationFeePending: Joi.any().required(),
            registrationFeePayable: Joi.any().required(),
            registrationFeePaid: Joi.any().required(),
            registrationFeePending: Joi.any().required(),
            totalInstallments: Joi.any().required(),
            installments: Joi.any().required(),
            isCourseChanged: Joi.boolean().required()
        })
        console.log(formData.installments)
        // return
        const result = createSchema.validate(formData)
        const { value, error } = result
        const valid = error == null
        if (!valid) {
            const { details } = error;
            reject({
                status: 400,
                success: false,
                message: details.map(i => i.message).join(',')
            });
        } else {

            Admission.findOne({ "_id": formData.admissionId })
                .then(async admission => {
                    if (!admission)
                        reject("Admission not found");
                    else {
                        if (admission.isActive) {
                            let calculateFeeData = await CalculateFee.findOne({ "admissionId": formData.admissionId }).lean()

                            let prevCalculateFeeData = calculateFeeData
                            // console.log("prevCalculatedFee",prevCalculateFeeData);
                            let newPrevCalculatedFeeObj = new PrevCalculateFee(prevCalculateFeeData)
                            newPrevCalculatedFeeObj._id = mongoose.Types.ObjectId()
                            newPrevCalculatedFeeObj.createdAt = Date.now()

                            newPrevCalculatedFeeObj.save()
                                .then(async savedPrevCalculatedFee => {
                                    {
                                        // console.log("prevcalsave", savedPrevCalculatedFee);
                                        if (formData.isCourseChanged) {

                                            let changeCourseObj = {
                                                prevTechnologies: admission.technologies,
                                                prevFeeStructure: savedPrevCalculatedFee._id,
                                                createdAt: Date.now()
                                            }
                                            admission.changeCourseLogs.push(changeCourseObj)

                                            if (typeof formData.technologies == 'string')
                                                admission.technologies = JSON.parse(formData.technologies)
                                            else admission.technologies = formData.technologies

                                        }

                                    }

                                    admission.save()
                                        .then(async admissionData => {

                                            let calculateFeeData = await CalculateFee.findOne({ "admissionId": formData.admissionId })

                                            calculateFeeData.totalFeesApplicable = formData.totalFeesApplicable
                                            calculateFeeData.totalFeeToBePaid = formData.totalFeeToBePaid
                                            calculateFeeData.discount = formData.discount
                                            calculateFeeData.totalFeePaid = formData.totalFeePaid
                                            calculateFeeData.totalBalance = formData.totalBalance
                                            calculateFeeData.isTotalFeePaid = formData.isTotalFeePaid

                                            calculateFeeData.registrationFeePayable = formData.registrationFeePayable
                                            calculateFeeData.registrationFeePaid = formData.registrationFeePaid
                                            calculateFeeData.registrationFeePending = formData.registrationFeePending
                                            calculateFeeData.isRegistrationFeePending = formData.isRegistrationFeePending
                                            if (!!formData.extra) calculateFeeData.extra = formData.extra
                                            let installments = []
                                            if (typeof formData.installments == 'string')
                                                installments = JSON.parse(formData.installments)
                                            else installments = formData.installments
                                            console.log("installments", installments)

                                            let nextInstallment;
                                            if (calculateFeeData.nextInstallment == 0) nextInstallment = 1
                                            else nextInstallment = calculateFeeData.nextInstallment
                                            for (let i = nextInstallment - 1; i < formData.totalInstallments; i++) {
                                                // console.log("Installments Obj", i,installments[i]);
                                                if (i <= calculateFeeData.totalInstallments - 1) {

                                                    calculateFeeData.installments[i].installmentNo = installments[i].installmentNo
                                                    calculateFeeData.installments[i].amountToBePaid = installments[i].amountToBePaid
                                                    calculateFeeData.installments[i].installmentMonth = installments[i].installmentMonth

                                                    if (calculateFeeData.installments[i].paidAmount != 0) {
                                                        // if some fee of an installment is paid
                                                        let paid = installments[i].paidAmount
                                                        for (let b of calculateFeeData.installments[i].balancePayments)
                                                            paid += b.paidAmount

                                                        let l = calculateFeeData.installments[i].balancePayments.length

                                                        if (paid < installments[i].amountToBePaid) {
                                                            calculateFeeData.installments[i].balance = installments[i].amountToBePaid - paid

                                                            calculateFeeData.installments[i].balancePayments[l - 1].amountToBePaid = calculateFeeData.installments[i].balance
                                                        }
                                                        else {
                                                            calculateFeeData.installments[i].balance = 0
                                                            calculateFeeData.installments[i].balancePayments[l - 1].amountToBePaid = 0
                                                            calculateFeeData.installments[i].isBalancePending = false
                                                            calculateFeeData.nextInstallment += 1
                                                        }
                                                    } else {
                                                        calculateFeeData.installments[i].paidAmount = installments[i].paidAmount
                                                        calculateFeeData.installments[i].balance = installments[i].amountToBePaid - installments[i].paidAmount
                                                        calculateFeeData.installments[i].balancePayments = []
                                                    }

                                                }
                                                else {
                                                    let newInstallment = {
                                                        installmentNo: installments[i].installmentNo,
                                                        amountToBePaid: installments[i].amountToBePaid,
                                                        paidAmount: installments[i].paidAmount,
                                                        balance: installments[i].amountToBePaid - installments[i].paidAmount,
                                                        balancePayments: [],
                                                        installmentMonth: installments[i].installmentMonth
                                                    }
                                                    calculateFeeData.installments.push(newInstallment)
                                                }

                                            }

                                            if (formData.totalInstallments < calculateFeeData.installments.length) {
                                                let deleteCount = calculateFeeData.installments.length - formData.totalInstallments
                                                calculateFeeData.installments.splice(formData.totalInstallments, deleteCount)
                                            }
                                            calculateFeeData.totalInstallments = formData.totalInstallments

                                            // calculateFeeData.totalInstallments = formData.totalInstallments;

                                            // in change course handle the installmentMonth


                                            if (calculateFeeData.totalBalance == 0) {
                                                calculateFeeData.isTotalFeePaid = true
                                                admissionData.isTotalFeePaid = true
                                                await admissionData.save()
                                            }
                                            calculateFeeData.save()
                                                .then(async savedCalculateFee => {
                                                    resolve({
                                                        status: 200,
                                                        success: true,
                                                        message: "Course Changed",
                                                        data: admissionData
                                                    })
                                                })
                                                .catch(next)
                                        })
                                        .catch(next)
                                }
                                )
                                .catch(next)
                        }
                        else reject("Student Not Active")
                    }
                })
                .catch(next)
        }
    });

}


async function dropAdmission(req, res, next) {
    await dropAdmissionFun(req).then(next).catch(next);
};
function dropAdmissionFun(req, next) {
    return new Promise((resolve, reject) => {
        let formData = req.body;
        console.log(formData);

        Admission.findById(formData.admissionId).then((res) => {
            res.dropReason = formData.dropReason;
            res.dropDate = new Date();
            res.status = false;
            res.save().then((savedData) => {
                CalculateFee.findOne({ admissionId: formData.admissionId, isEnquiryFee: false }).then((feeData) => {
                    feeData.status = false;
                    feeData.save().then(() => {
                        resolve({
                            status: 200,
                            success: true,
                            message: "Admission Drop Successfully",
                        })
                    }).catch(next);
                }).catch(next);
            }).catch(next)
        })
    });
}

async function dropAdmissionList(req, res, next) {
    await dropAdmissionListFun(req).then(next).catch(next);
};


function dropAdmissionListFun(req, next) {
    return new Promise((resolve, reject) => {
        let formData = req.body;


        let find = { isDelete: false, status: false };


        if (formData.startDate) {
            let start = new Date(formData.startDate);
            start.setHours(0, 0, 0, 0);
            find.dropDate = { ...find.dropDate, $gte: start };
        }

        if (formData.endDate) {
            let end = new Date(formData.endDate);
            end.setHours(23, 59, 59, 999);
            find.dropDate = { ...find.dropDate, $lte: end };
        }


        if (formData.sessionYearId) {
            find.sessionYearId = formData.sessionYearId;
        }


        if (formData.company) {
            find.company = formData.company;
        }


        if (formData.courseId) {
            find["technologies.course"] = formData.courseId;
        }


        Admission.find(find)
            .populate("technologies")
            .populate("college")
            .populate("studentId")
            .populate("managementPersonId")
            .populate({
                path: "technologies.course",
                select: "name",
            })
            .populate({
                path: "technologies.enquiryTakenBy",
            })
            .populate({
                path: "batches.batchId",
                populate: [
                    { path: "employeeId" },
                    { path: "technology" },
                    { path: "labId" },
                    { path: "timeSlotId" },
                ],
            })
            .sort({ dueDate: -1 })
            .exec()
            .then(res => {
                resolve({
                    status: 200,
                    success: true,
                    message: "Admission Drop loaded Successfully",
                    data: res,
                    total: res.length,
                });
            })
            .catch(next);
    });
}


