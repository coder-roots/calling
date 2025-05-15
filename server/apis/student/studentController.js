const Student = require('./studentModel')
const Admission = require('../admission/admissionModel')
const SessionYear = require('../sessionYear/sessionYearModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')
const { Session } = require('inspector')


module.exports = {
    index,
    fetchStudentById,
    addStudent,
    updateStudent,
    deleteStudent
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
        if (req.headers != undefined && req.headers.sessionyearid != undefined && db.isValid(req.headers.sessionyearid)) {
            formData.sessionYearId = req.headers.sessionyearid
        }
        var find = { $and: [formData] }
        if (formData.search != undefined) {
            search = formData.search.trim()
            find = {
                $and: [{ studentName: { $regex: search, $options: 'i' } }, find]
            }
            delete formData.search
        }

        Student.find(find)
            .populate('college')
            .skip(skip1)
            .limit(lim)
            .exec()
            .then(async alldocuments => {
                var total = 0
                total = await Student.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All Students Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}
async function addStudent(req, res, next) {
    await addStudentFun(req, next).then(next).catch(next);
}
function addStudentFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        const createSchema = Joi.object().keys({
            studentName: Joi.string().required(),
            personalContact: Joi.number().required(),
            parentsContact: Joi.number().required(),
            email: Joi.string().required(),
            company: Joi.string().required(),
            address: Joi.string(),
            fatherName: Joi.string(),
            college: Joi.string(),
            collegeCourse: Joi.string()
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
            await Student.findOne({ $and: [{ email: formData.email }, { isDelete: false }] }).then(studentData => {
                if (!studentData) {
                    Student.countDocuments()
                        .then(async total => {
                            var student = Student()
                            student.studentAutoId = total + 1
                            student.studentName = formData.studentName
                            student.company = formData.company
                            student.personalContact = formData.personalContact
                            student.email = formData.email
                            student.parentsContact = formData.parentsContact
                            if (!!req.body.address) student.address = formData.address
                            if (!!req.body.fatherName) student.fatherName = formData.fatherName
                            if (!!req.body.college) student.college = formData.college
                            if (!!req.body.collegeCourse) student.collegeCourse = formData.collegeCourse

                            let session = await SessionYear.findOne({ isActive: true })
                            if (!!session && !!req.headers.sessionyearid) student.sessionYearId = session._id

                            if (req.decoded.addedById) student.addedById = req.decoded.addedById
                            student.save()
                                .then(saveRes => {
                                    resolve({
                                        status: 200, success: true, message: "Student added successfully.", data: saveRes
                                    })
                                }).catch(err => {
                                    // helper.unlinkImage(req.file)
                                    reject({ success: false, status: 500, message: err })
                                })

                        })
                } else {
                    // helper.unlinkImage(req.file)
                    reject({ success: false, status: 422, message: "Student already exists with same name" })
                }

            })
        }
    })
}
async function fetchStudentById(req, res, next) {
    await fetchStudentByIdFun(req, next).then(next).catch(next);
};
function fetchStudentByIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                var finder = { $and: [formData] };
                Student.findOne(finder)
                    .populate('courses')
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Single Student Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("Student not found");
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
async function updateStudent(req, res, next) {
    await updateStudentFun(req).then(next).catch(next);
};
function updateStudentFun(req, next) {

    // console.log(req.body);
    let formData = req.body
    let isValidated = true
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                Student.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("Student not found");
                        else {
                            if (!!formData.enquiryId) res.enquiryId = formData.enquiryId
                            if (!!formData.studentName) res.studentName = formData.studentName
                            if (!!formData.company) res.company = formData.company
                            if (!!formData.personalContact) res.personalContact = formData.personalContact
                            if (!!formData.parentsContact) res.parentsContact = formData.parentsContact
                            if (!!formData.address) res.address = formData.address
                            if (!!formData.fatherName) res.fatherName = formData.fatherName
                            if (!!formData.email) res.email = formData.email
                            if (!!formData.college) res.college = formData.college
                            if (!!formData.collegeCourse) res.collegeCourse = formData.collegeCourse
                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                            let id = res._id
                            if (!!formData.email) {
                                await Student.findOne({ $and: [{ email: formData.email }, { isDelete: false }, { _id: { $ne: id } }] }).then(existingStudent => {
                                    if (existingStudent != null)
                                        isValidated = false
                                })
                            }
                            res.updatedAt = new Date();
                            if (isValidated) {
                                res.save()
                                    .then(async res => {
                                        const addmissionData = await Admission.findOne({ studentId: res._id })
                                        if (addmissionData) {
                                            if (!!formData.company) addmissionData.company = formData.company
                                            addmissionData.save()
                                        }
                                        {
                                            resolve({
                                                status: 200,
                                                success: true,
                                                message: "Student Updated Successfully",
                                                data: res
                                            })
                                        }
                                    })
                                    .catch(next)
                            } else {
                                reject("Student exists with same email")
                            }
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
async function deleteStudent(req, res, next) {
    await deleteStudentFun(req).then(next).catch(next);
};
function deleteStudentFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            Student.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("Student not found");
                    else {
                        res.isDelete = true
                        res.updatedAt = new Date();
                        if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                        res.save()
                            .then(res => {
                                {
                                    resolve({
                                        status: 200,
                                        success: true,
                                        message: "Student deleted Successfully"
                                    })
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