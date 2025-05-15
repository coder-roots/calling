const CollegeCourse = require('./collegeCourseModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')


module.exports = {
    index,
    fetchCollegeCourseById,
    addCollegeCourse,
    updateCollegeCourse,
    deleteCollegeCourse
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
        CollegeCourse.find(find)
            .skip(skip1)
            .limit(lim)
            .exec()
            .then(async alldocuments => {
                var total = 0
                total = await CollegeCourse.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All CollegeCourses Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}
async function addCollegeCourse(req, res, next) {
    await addCollegeCourseFun(req, next).then(next).catch(next);
}
function addCollegeCourseFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        const createSchema = Joi.object().keys({
            name: Joi.string().required()
        }).unknown(true);
        const result = createSchema.validate(formData)
        const { value, error } = result
        const valid = error == null
        if (!valid) {
            const { details } = error;
            helper.unlinkImage(req.file)
            reject({
                status: 400,
                success: false,
                message: details.map(i => i.message).join(',')
            });
        } else {
            await CollegeCourse.findOne({ $and: [{ name: formData.name }, { isDelete: false }] }).then(collegeCourseData => {
                if (!collegeCourseData) {
                    CollegeCourse.countDocuments()
                        .then(total => {
                            var collegeCourse = CollegeCourse()
                            collegeCourse.collegeCourseAutoId = total + 1
                            collegeCourse.name = formData.name
                            if (req.decoded.addedById) collegeCourse.addedById = req.decoded.addedById
                            collegeCourse.save()
                                .then(saveRes => {
                                    resolve({
                                        status: 200, success: true, message: "College Course added successfully.", data: saveRes
                                    })
                                }).catch(err => {
                                    // helper.unlinkImage(req.file)
                                    reject({ success: false, status: 500, message: err })
                                })

                        })
                } else {
                    // helper.unlinkImage(req.file)
                    reject({ success: false, status: 422, message: "College Course already exists" })
                }

            })
        }
    })
}
async function fetchCollegeCourseById(req, res, next) {
    await fetchCollegeCourseByIdFun(req, next).then(next).catch(next);
};
function fetchCollegeCourseByIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                var finder = { $and: [formData] };
                CollegeCourse.findOne(finder)
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Single College Course Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("College Course not found");
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
async function updateCollegeCourse(req, res, next) {
    await updateCollegeCourseFun(req).then(next).catch(next);
};
function updateCollegeCourseFun(req, next) {
    let formData = req.body
    let isValidated = true
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                CollegeCourse.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("College Course not found");
                        else {
                            if (!!formData.name) res.name = formData.name
                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                            let id = res._id
                            if (!!formData.name) {
                                await CollegeCourse.findOne({ $and: [{ name: formData.name }, { isDelete: false }, { _id: { $ne: id } }] }).then(existingCollegeCourse => {
                                    if (existingCollegeCourse != null)
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
                                                message: "College Course Updated Successfully",
                                                data: res
                                            })
                                        }
                                    })
                                    .catch(next)
                            } else {
                                reject("College Course already exists")
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
async function deleteCollegeCourse(req, res, next) {
    await deleteCollegeCourseFun(req).then(next).catch(next);
};
function deleteCollegeCourseFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            CollegeCourse.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("College Course not found");
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
                                        message: "College Course deleted Successfully"
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