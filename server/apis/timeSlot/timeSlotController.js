const TimeSlot = require('./timeSlotModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')

 
module.exports = {
    index,
    fetchTimeSlotById,
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot
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

        TimeSlot.find(find)
            .skip(skip1)
            .limit(lim)
            .exec()
            .then(async alldocuments => {
                var total = 0
                total = await TimeSlot.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All TimeSlots Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}
async function addTimeSlot(req, res, next) {
    await addTimeSlotFun(req, next).then(next).catch(next);
}
function addTimeSlotFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        const createSchema = Joi.object().keys({
            slot: Joi.string().required(),
            // duration: Joi.number().required()
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
            await TimeSlot.findOne({ $and: [{ slot: formData.slot }, { isDelete: false }] }).then(timeSlotData => {
                if (!timeSlotData) {
                    TimeSlot.countDocuments()
                        .then(total => {
                            var timeSlot = TimeSlot()
                            timeSlot.timeSlotAutoId = total + 1
                            timeSlot.slot = formData.slot
                            // timeSlot.capacity = formData.capacity
                            if (req.decoded.addedById) timeSlot.addedById = req.decoded.addedById
                            timeSlot.save()
                                .then(saveRes => {
                                    resolve({
                                        status: 200, success: true, message: "TimeSlot added successfully.", data: saveRes
                                    })
                                }).catch(err => {
                                    // helper.unlinkImage(req.file)
                                    reject({ success: false, status: 500, message: err })
                                })

                        })
                } else {
                    // helper.unlinkImage(req.file)
                    reject({ success: false, status: 422, message: "TimeSlot already exists" })
                }

            })
        }
    })
}
async function fetchTimeSlotById(req, res, next) {
    await fetchTimeSlotByIdFun(req, next).then(next).catch(next);
};
function fetchTimeSlotByIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                var finder = { $and: [formData] };
                TimeSlot.findOne(finder)
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Single TimeSlot Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("TimeSlot not found");
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
async function updateTimeSlot(req, res, next) {
    await updateTimeSlotFun(req).then(next).catch(next);
};
function updateTimeSlotFun(req, next) {
    let formData = req.body
    let isValidated = true
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                TimeSlot.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("TimeSlot not found");
                        else {
                            if (!!formData.slot) res.slot = formData.slot
                            // if (!!formData.duration) res.duration = formData.duration
                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                            let id = res._id
                            if (!!formData.slot) {
                                await TimeSlot.findOne({ $and: [{ slot: formData.slot }, { isDelete: false }, { _id: { $ne: id } }] }).then(existingTimeSlot => {
                                    if (existingTimeSlot != null)
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
                                                message: "TimeSlot Updated Successfully",
                                                data: res
                                            })
                                        }
                                    })
                                    .catch(next)
                            } else {
                                reject("TimeSlot exists with same email")
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
async function deleteTimeSlot(req, res, next) {
    await deleteTimeSlotFun(req).then(next).catch(next);
};
function deleteTimeSlotFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            TimeSlot.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("TimeSlot not found");
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
                                        message: "TimeSlot deleted Successfully"
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