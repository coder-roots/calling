const College = require('./collegeModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')


module.exports = {
    index,
    fetchCollegeById,
    addCollege,
    updateCollege,
    deleteCollege
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
        College.find(find)
            .skip(skip1)
            .limit(lim)
            .exec()
            .then(async alldocuments => {
                var total = 0
                total = await College.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All Colleges Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}
async function addCollege(req, res, next) {
    await addCollegeFun(req, next).then(next).catch(next);
}
function addCollegeFun(req, next) {
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
            await College.findOne({ $and: [{ name: formData.name }, { isDelete: false }] }).then(collegeData => {
                if (!collegeData) {
                    College.countDocuments()
                        .then(total => {
                            var college = College()
                            college.collegeAutoId = total + 1
                            college.name = formData.name
                            if (req.decoded.addedById) college.addedById = req.decoded.addedById
                            college.save()
                                .then(saveRes => {
                                    resolve({
                                        status: 200, success: true, message: "College added successfully.", data: saveRes
                                    })
                                }).catch(err => {
                                    // helper.unlinkImage(req.file)
                                    reject({ success: false, status: 500, message: err })
                                })

                        })
                } else {
                    // helper.unlinkImage(req.file)
                    reject({ success: false, status: 422, message: "College already exists with same name" })
                }

            })
        }
    })
}
async function fetchCollegeById(req, res, next) {
    await fetchCollegeByIdFun(req, next).then(next).catch(next);
};
function fetchCollegeByIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                var finder = { $and: [formData] };
                College.findOne(finder)
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Single College Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("College not found");
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
async function updateCollege(req, res, next) {
    await updateCollegeFun(req).then(next).catch(next);
};
function updateCollegeFun(req, next) {
    let formData = req.body
    let isValidated = true
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                College.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("College not found");
                        else {
                            if (!!formData.name) res.name = formData.name
                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                            let id = res._id
                            if (!!formData.name) {
                                await College.findOne({ $and: [{ name: formData.name }, { isDelete: false }, { _id: { $ne: id } }] }).then(existingCollege => {
                                    if (existingCollege != null)
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
                                                message: "College Updated Successfully",
                                                data: res
                                            })
                                        }
                                    })
                                    .catch(next)
                            } else {
                                reject("College already exists with same name")
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
async function deleteCollege(req, res, next) {
    await deleteCollegeFun(req).then(next).catch(next);
};
function deleteCollegeFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            College.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("College not found");
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
                                        message: "College deleted Successfully"
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