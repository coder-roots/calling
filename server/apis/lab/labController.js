const Lab = require('./labModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')


module.exports = {
    index,
    fetchLabById,
    addLab,
    updateLab,
    deleteLab
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

        Lab.find(find)
            .skip(skip1)
            .limit(lim)
            .exec()
            .then(async alldocuments => {
                var total = 0
                total = await Lab.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All Labs Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}
async function addLab(req, res, next) {
    await addLabFun(req, next).then(next).catch(next);
}
function addLabFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        const createSchema = Joi.object().keys({
            name: Joi.string().required(),
            capacity: Joi.number().required()
        });
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
            await Lab.findOne({ $and: [{ name: formData.name }, { isDelete: false }] }).then(labData => {
                if (!labData) {
                    Lab.countDocuments()
                        .then(total => {
                            var lab = Lab()
                            lab.labAutoId = total + 1
                            lab.name = formData.name
                            lab.capacity = formData.capacity
                            // lab.image = "lab/" + formData.image
                            // lab.trimImage = "lab/" + formData.trimImage
                            if (req.decoded.addedById) lab.addedById = req.decoded.addedById
                            lab.save()
                                .then(saveRes => {
                                    resolve({
                                        status: 200, success: true, message: "Lab added successfully.", data: saveRes
                                    })
                                }).catch(err => {
                                    // helper.unlinkImage(req.file)
                                    reject({ success: false, status: 500, message: err })
                                })

                        })
                } else {
                    // helper.unlinkImage(req.file)
                    reject({ success: false, status: 422, message: "Lab already exists with same name" })
                }

            })
        }
    })
}
async function fetchLabById(req, res, next) {
    await fetchLabByIdFun(req, next).then(next).catch(next);
};
function fetchLabByIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                var finder = { $and: [formData] };
                Lab.findOne(finder)
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Single Lab Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("Lab not found");
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
async function updateLab(req, res, next) {
    await updateLabFun(req).then(next).catch(next);
};
function updateLabFun(req, next) {
    let formData = req.body
    let isValidated = true
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                Lab.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("Lab not found");
                        else {
                            if (!!formData.name) res.name = formData.name
                            if (!!formData.capacity) res.capacity = formData.capacity
                            // if (!!formData.image) res.image = "lab/" + formData.image;
                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                            let id = res._id
                            if (!!formData.name) {
                                await Lab.findOne({ $and: [{ name: formData.name }, { isDelete: false }, { _id: { $ne: id } }] }).then(existingLab => {
                                    if (existingLab != null)
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
                                                message: "Lab Updated Successfully",
                                                data: res
                                            })
                                        }
                                    })
                                    .catch(next)
                            } else {
                                reject("Lab exists with same email")
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
async function deleteLab(req, res, next) {
    await deleteLabFun(req).then(next).catch(next);
};
function deleteLabFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            Lab.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("Lab not found");
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
                                        message: "Lab deleted Successfully"
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