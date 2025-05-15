const Duration = require('./durationModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')


module.exports = {
    index,
    fetchDurationById,
    addDuration,
    updateDuration,
    deleteDuration
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

        Duration.find(find)
            .skip(skip1)
            .limit(lim)
            .exec()
            .then(async alldocuments => {
                var total = 0
                total = await Duration.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All Durations Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}
async function addDuration(req, res, next) {
    await addDurationFun(req, next).then(next).catch(next);
}
function addDurationFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        const createSchema = Joi.object().keys({
            duration: Joi.string().required(),
            installments: Joi.number().required()
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
            await Duration.findOne({ $and: [{ duration: formData.duration }, { isDelete: false }] }).then(durationData => {
                if (!durationData) {
                    Duration.countDocuments()
                        .then(total => {
                            var duration = Duration()
                            duration.durationAutoId = total + 1
                            duration.duration = formData.duration
                            duration.installments = formData.installments
                            if (req.decoded.addedById) duration.addedById = req.decoded.addedById
                            duration.save()
                                .then(saveRes => {
                                    resolve({
                                        status: 200, success: true, message: "Duration added successfully.", data: saveRes
                                    })
                                }).catch(err => {
                                    // helper.unlinkImage(req.file)
                                    reject({ success: false, status: 500, message: err })
                                })

                        })
                } else {
                    // helper.unlinkImage(req.file)
                    reject({ success: false, status: 422, message: "Duration already exists" })
                }

            })
        }
    })
}
async function fetchDurationById(req, res, next) {
    await fetchDurationByIdFun(req, next).then(next).catch(next);
};
function fetchDurationByIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                var finder = { $and: [formData] };
                Duration.findOne(finder)
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Single Duration Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("Duration not found");
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
async function updateDuration(req, res, next) {
    await updateDurationFun(req).then(next).catch(next);
};
function updateDurationFun(req, next) {
    let formData = req.body
    let isValidated = true
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                Duration.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("Duration not found");
                        else {
                            if (!!formData.duration) res.duration = formData.duration
                            if (!!formData.installments) res.installments = formData.installments
                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                            let id = res._id
                            if (!!formData.duration) {
                                await Duration.findOne({ $and: [{ duration: formData.duration }, { isDelete: false }, { _id: { $ne: id } }] }).then(existingDuration => {
                                    if (existingDuration != null)
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
                                                message: "Duration Updated Successfully",
                                                data: res
                                            })
                                        }
                                    })
                                    .catch(next)
                            } else {
                                reject("Duration already exists")
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
async function deleteDuration(req, res, next) {
    await deleteDurationFun(req).then(next).catch(next);
};
function deleteDurationFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            Duration.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("Duration not found");
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
                                        message: "Duration deleted Successfully"
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