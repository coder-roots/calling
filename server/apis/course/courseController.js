const Course = require('./courseModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')


module.exports = {
    index,
    fetchCourseById,
    addCourse,
    updateCourse,
    deleteCourse
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
        var find = { $and: [formData] }
        if (formData.search != undefined) {
            search = formData.search.trim()
            find = {
                $and: [ { name: { $regex:search, $options: 'i' } }, find]
            }
            delete formData.search
        }
        
        
        // console.log(find)
        Course.find(find)
            .skip(skip1)
            .limit(lim)
            .populate('duration')
            .exec()
            .then(async alldocuments => {
                var total = 0
                total = await Course.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All Courses Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}
async function addCourse(req, res, next) {
    await addCourseFun(req, next).then(next).catch(next);
}
function addCourseFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        // console.log(formData);
        const createSchema = Joi.object().keys({
            name: Joi.string().required(),
            fee: Joi.number().required(),
            minimumRegistrationFee: Joi.number().required(),
            duration: Joi.string().required(),
            detail: Joi.any(),
            image: Joi.string().required(),
            courseType: Joi.number().required()
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
            await Course.findOne({ $and: [{ name: formData.name }, { isDelete: false }] }).then(courseData => {
                if (!courseData) {
                    Course.countDocuments()
                        .then(total => {
                            var course = Course()
                            course.courseAutoId = total + 1
                            course.name = formData.name
                            course.fee = formData.fee
                            course.minimumRegistrationFee = formData.minimumRegistrationFee
                            course.duration = formData.duration
                            if(!!formData.detail) course.detail = formData.detail
                            course.courseType = formData.courseType
                            course.image = "course/" + formData.image
                            course.trimImage = "course/" + formData.trimImage
                            if (req.decoded.addedById) course.addedById = req.decoded.addedById
                            course.save()
                                .then(saveRes => {
                                    resolve({
                                        status: 200, success: true, message: "Course added successfully.", data: saveRes
                                    })
                                }).catch(err => {
                                    // helper.unlinkImage(req.file)
                                    reject({ success: false, status: 500, message: err })
                                })

                        })
                } else {
                    // helper.unlinkImage(req.file)
                    reject({ success: false, status: 422, message: "Course already exists with same name" })
                }

            })
        }
    })
}
async function fetchCourseById(req, res, next) {
    await fetchCourseByIdFun(req, next).then(next).catch(next);
};
function fetchCourseByIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                var finder = { $and: [formData] };
                Course.findOne(finder)
                    .populate('duration')
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Single Course Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("Course not found");
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
async function updateCourse(req, res, next) {
    await updateCourseFun(req).then(next).catch(next);
};
function updateCourseFun(req, next) {
    let formData = req.body
    // console.log("form Data", formData );
    let isValidated = true
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                Course.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("Course not found");
                        else {
                            if (!!formData.name) res.name = formData.name
                            if (!!formData.fee) res.fee = formData.fee
                            if (!!formData.duration) res.duration = formData.duration
                            if (!!formData.minimumRegistrationFee) res.minimumRegistrationFee = formData.minimumRegistrationFee
                            if (!!formData.courseType) res.courseType = formData.courseType
                            if (!!formData.detail) res.detail = formData.detail
                            if (!!formData.image) {
                                // console.log("dir", __dirname);
                                helper.unlinkImageUsingPath("server/public/"+res.image)
                                res.image = "course/" + formData.image;
                            }      
                            if (!!formData.trimImage) {
                                helper.unlinkImageUsingPath("server/public/"+res.trimImage)
                                res.trimImage = "course/" + formData.trimImage;
                            }      
                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                            let id = res._id
                            if (!!formData.name) {
                                await Course.findOne({ $and: [{ name: formData.name }, { isDelete: false }, { _id: { $ne: id } }] }).then(existingCourse => {
                                    if (existingCourse != null)
                                        isValidated = false
                                })
                            }
                            res.updatedAt = new Date();
                            if (isValidated) {
                                res.save()
                                    .then(res => {
                                        {
                                            resolve({
                                                status: 200,
                                                success: true,
                                                message: "Course Updated Successfully",
                                                data: res
                                            })
                                        }
                                    })
                                    .catch(next)
                            } else {
                                reject("Course exists with same email")
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
async function deleteCourse(req, res, next) {
    await deleteCourseFun(req).then(next).catch(next);
};
function deleteCourseFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            Course.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("Course not found");
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
                                        message: "Course deleted Successfully"
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