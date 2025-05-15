const Enquiry = require('./enquiryModel')
const SessionYear = require('../sessionYear/sessionYearModel')
const Course = require('../course/courseModel')
const Employee = require('../employee/employeeModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')


module.exports = {
    index,
    fetchEnquiryById,
    addEnquiry,
    addEnquiryMultiple,
    updateEnquiry,
    deleteEnquiry,
    dropEnquiry,
    dropEnquiryList
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
        if (!!formData.startDate && !!formData.endDate) {
            let start = new Date(formData.startDate)
            start.setHours(0, 0, 0, 0)
            let end = new Date(formData.endDate)
            end.setHours(23, 59, 59, 999)
            formData.createdAt = { $gt: start, $lt: end }
            delete formData.startDate
            delete formData.endDate
        }
        if (req.headers != undefined && req.headers.sessionyearid != undefined && db.isValid(req.headers.sessionyearid)) {
            formData.sessionYearId = req.headers.sessionyearid
        }
        if (formData.search) {
            const searchRegex = new RegExp(formData.search, 'i');
            formData.$or = [
                { studentName: searchRegex },
                { email: searchRegex }
            ];
            delete formData.search;
        }
        var find = { $and: [formData] }
        // console.log("enquiry find",find);
        Enquiry.find(find)
            .skip(skip1)
            .limit(lim)
            .populate('college', 'name')
            .populate('collegeCourseId', 'name')
            .populate({ path: 'technologies.course' })
            .populate({ path: 'technologies.enquiryTakenBy' })
            .populate('managementPersonId')
            .sort({ createdAt: -1 })
            .exec()
            .then(async alldocuments => {
                var total = 0
                total = await Enquiry.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All Enquirys Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}

async function addEnquiry(req, res, next) {
    await addEnquiryFun(req, next).then(next).catch(next);
};
function addEnquiryFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        // console.log(formData);
        const createSchema = Joi.object().keys({
            isNewStudent: Joi.boolean().required(),
            studentId: Joi.any(),
            studentName: Joi.string().required(),
            personalContact: Joi.number().required(),
            parentsContact: Joi.any(),
            email: Joi.string().required(),
            isOfficialTraining: Joi.boolean().required(),
            trainingType: Joi.any(),
            isPassout: Joi.boolean().required(),
            college: Joi.string(),
            collegeCourseId: Joi.string(),
            semester: Joi.any(),
            enquiryDate: Joi.any(),
            technologies: Joi.any().required(),
            managementPersonId: Joi.string().required(),
            comments: Joi.any(),
            company: Joi.string().required(),
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
            Enquiry.countDocuments()
                .then(async total => {
                    var enquiry = Enquiry()
                    enquiry.enquiryAutoId = total + 1
                    enquiry.isNewStudent = formData.isNewStudent
                    if (!!req.body.studentId) enquiry.studentId = formData.studentId

                    enquiry.studentName = formData.studentName
                    enquiry.personalContact = formData.personalContact
                    if (!!req.body.parentsContact) enquiry.parentsContact = formData.parentsContact
                    enquiry.email = formData.email

                    enquiry.isOfficialTraining = formData.isOfficialTraining
                    enquiry.isPassout = formData.isPassout
                    if (!!req.body.trainingType) enquiry.trainingType = formData.trainingType
                    if (!!req.body.college) enquiry.college = formData.college
                    if (!!req.body.collegeCourseId) enquiry.collegeCourseId = formData.collegeCourseId
                    if (!!req.body.semester) enquiry.semester = formData.semester
                    if (!!req.body.company) enquiry.company = formData.company

                    if (!!req.body.enquiryDate) enquiry.enquiryDate = formData.enquiryDate
                    enquiry.managementPersonId = formData.managementPersonId
                    if (!!req.body.comments) enquiry.comments = formData.comments

                    if (typeof formData.technologies == 'string')
                        enquiry.technologies = JSON.parse(formData.technologies)
                    else
                        enquiry.technologies = formData.technologies
                    let session = await SessionYear.findOne({ isActive: true })
                    if (!!session && !!req.headers.sessionyearid) enquiry.sessionYearId = session._id

                    if (req.decoded.addedById) enquiry.addedById = req.decoded.addedById
                    enquiry.save()
                        .then(saveRes => {
                            resolve({
                                status: 200, success: true, message: "Enquiry added successfully.", data: saveRes
                            })
                        }).catch(err => {
                            // helper.unlinkImage(req.file)
                            reject({ success: false, status: 500, message: err })
                        })

                })

        }
    })
}
async function addEnquiryMultiple(req, res, next) {
    await addEnquiryMultipleFun(req, next).then(next).catch(next);
};
function addEnquiryMultipleFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        // console.log(formData);
        const createSchema = Joi.object().keys({
            enqArray: Joi.any().required()
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

            let enqArray = []
            if (typeof formData.enqArray == 'string')
                enqArray = JSON.parse(formData.enqArray)
            else enqArray = formData.enqArray

            if (enqArray.length == 0)
                reject("No Data Found")
            else {
                let totalEnq = enqArray.length
                for (let i in enqArray) {
                    let enq = enqArray[i]
                    Enquiry.countDocuments()
                        .then(async total => {
                            var enquiry = new Enquiry()
                            enquiry.enquiryAutoId = total + Number(i) + 1
                            enquiry.isNewStudent = true

                            enquiry.studentName = enq.studentName
                            enquiry.personalContact = enq.personalContact
                            enquiry.parentsContact = enq.parentsContact
                            enquiry.email = enq.email

                            if (enq.isOfficialTraining == 'yes') enquiry.isOfficialTraining = true
                            if (enq.isOfficialTraining == 'no') enquiry.isOfficialTraining = false

                            if (enq.isPassout == 'yes') enquiry.isPassout = true
                            if (enq.isPassout == 'no') enquiry.isPassout = false

                            enquiry.trainingType = enq.trainingType
                            enquiry.college = enq.college
                            enquiry.collegeCourseId = enq.collegeCourseId
                            enquiry.semester = Number(enq.semester)

                            enquiry.enquiryDate = enq.enquiryDate
                            let managementPerson = await Employee.findOne({ employeeAutoId: Number(enq.managementPersonId) })
                            enquiry.managementPersonId = managementPerson._id

                            if (!!enq.comments) enquiry.comments = enq.comments
                            enquiry.technologies = []
                            // console.log("enq",enq.technologies);
                            let technologies = []
                            if (typeof enq.technologies == 'string')
                                technologies = JSON.parse(enq.technologies)
                            else
                                technologies = enq.technologies
                            // console.log("technologies",technologies);

                            for (let j in technologies) {
                                let tech = technologies[j]
                                let course = await Course.findOne({ courseAutoId: Number(tech.course) }).populate('duration')
                                let expert = await Employee.findOne({ employeeAutoId: Number(tech.enquiryTakenBy) })
                                tech.course = course._id
                                tech.enquiryTakenBy = expert._id
                                tech.duration = course.duration.duration
                                tech.installments = course.duration.installments
                                tech.fee = course.fee
                                tech.minimumRegistrationFee = course.minimumRegistrationFee
                                // tech.discount = tech.discount
                                enquiry.technologies.push(tech)
                            }
                            // console.log("enquiry.technologies", enquiry.technologies);
                            if (!!session && !!req.headers.sessionyearid) enquiry.sessionYearId = session._id

                            if (req.decoded.addedById) enquiry.addedById = req.decoded.addedById
                            enquiry.save()
                                .then(saveRes => {
                                    if (totalEnq - 1 == i) {
                                        resolve({
                                            status: 200, success: true, message: "Enquiry added successfully.", data: saveRes
                                        })
                                    }
                                }).catch(err => {
                                    // helper.unlinkImage(req.file)
                                    reject({ success: false, status: 500, message: err })
                                })

                        })
                }
            }

        }
    })
}

async function fetchEnquiryById(req, res, next) {
    await fetchEnquiryByIdFun(req, next).then(next).catch(next);
};
function fetchEnquiryByIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                var finder = { $and: [formData] };
                Enquiry.findOne(finder)
                    .populate('college', 'name')
                    .populate('collegeCourseId', 'name')
                    .populate({ path: 'technologies.course' })
                    .populate({ path: 'technologies.enquiryTakenBy' })
                    .populate('managementPersonId')
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Single Enquiry Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("Enquiry not found");
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

async function updateEnquiry(req, res, next) {
    await updateEnquiryFun(req).then(next).catch(next);
};
function updateEnquiryFun(req, next) {

    // console.log(req.body);
    let formData = req.body
    // let isValidated = true
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                Enquiry.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("Enquiry not found");
                        else {

                            if (!!formData.isNewStudent) res.isNewStudent = formData.isNewStudent
                            if (!!formData.studentId) res.studentId = formData.studentId

                            if (!!formData.studentName) res.studentName = formData.studentName
                            if (!!formData.parentsContact) res.parentsContact = formData.parentsContact
                            if (!!formData.personalContact) res.personalContact = formData.personalContact
                            if (!!formData.email) res.email = formData.email

                            if (!!formData.isOfficialTraining) res.isOfficialTraining = formData.isOfficialTraining
                            if (!!formData.trainingType) res.trainingType = formData.trainingType
                            if (!!formData.isPassout) res.isPassout = formData.isPassout
                            if (!!formData.college) res.college = formData.college
                            if (!!formData.collegeCourseId) res.collegeCourseId = formData.collegeCourseId

                            if (!!formData.semester) res.semester = formData.semester
                            if (!!formData.company) res.company = formData.company

                            if (!!formData.technologies) {
                                if (typeof formData.technologies == 'string') res.technologies = JSON.parse(formData.technologies)
                                else res.technologies = formData.technologies
                            }
                            if (!!formData.managementPersonId) res.managementPersonId = formData.managementPersonId
                            if (!!formData.isAdmissionConfirmed) res.isAdmissionConfirmed = formData.isAdmissionConfirmed
                            if (!!formData.comments) res.comments = formData.comments
                            if (!!formData.enquiryDate) res.enquiryDate = formData.enquiryDate

                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                            res.updatedAt = new Date();
                            // let id = res._id
                            // if (!!formData.email) {
                            //     await Enquiry.findOne({ $and: [{ email: formData.email }, { isDelete: false }, { _id: { $ne: id } }] }).then(existingEnquiry => {
                            //         if (existingEnquiry != null)
                            //             isValidated = false
                            //     })
                            // }
                            // if (isValidated) {
                            res.save()
                                .then(res => {
                                    {
                                        resolve({
                                            status: 200,
                                            success: true,
                                            message: "Enquiry Updated Successfully",
                                            data: res
                                        })
                                    }
                                })
                                .catch(next)
                            // } else {
                            //     reject("Enquiry exists with same email")
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

async function deleteEnquiry(req, res, next) {
    await deleteEnquiryFun(req).then(next).catch(next);
};
function deleteEnquiryFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            Enquiry.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("Enquiry not found");
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
                                        message: "Enquiry deleted Successfully"
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


async function dropEnquiry(req, res, next) {
  await dropEnquiryFun(req).then(next).catch(next);
};
function dropEnquiryFun(req, next) {
  let formData = req.body
  return new Promise((resolve, reject) => {
      if (formData != undefined && formData._id != undefined) {
          Enquiry.findOne({ "_id": formData._id })
              .then(async res => {
                  if (!res)
                      reject("Enquiry not found");
                  else {
                     res.dropById = req.decoded.updatedById
                     res.dropAt = new Date();
                     res.dropReason =  formData.dropReason
                     res.isDrop = true;
                      res.save()
                          .then(res => {
                              {
                                  resolve({
                                      status: 200,
                                      success: true,
                                      message: "Enquiry deleted Successfully"
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


async function dropEnquiryList(req, res, next) {
    await dropEnquiryListFun(req).then(next).catch(next);
};


function dropEnquiryListFun(req, next) {
    return new Promise((resolve, reject) => {
        let formData = req.body;
        


        let find = { isDelete:false,isDrop:true };



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


        Enquiry.find(find)
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
            .sort({ dueDate: -1 })
            .exec()
            .then(res => {
                resolve({
                    status: 200,
                    success: true,
                    message: "Enquires Drop loaded Successfully",
                    data: res,
                    total: res.length,
                });
            })
            .catch(next);
    });
}
