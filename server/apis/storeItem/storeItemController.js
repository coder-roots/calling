const StoreItem = require('./storeItemModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')


module.exports = {
    index,
    fetchStoreItemById,
    addStoreItem,
    updateStoreItem,
    deleteStoreItem
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

        StoreItem.find(find)
            .populate('assignedTo')
            .populate('labId')
            .skip(skip1)
            .limit(lim)
            .exec()
            .then(async alldocuments => {
                var total = 0
                total = await StoreItem.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All StoreItems Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}
async function addStoreItem(req, res, next) {
    await addStoreItemFun(req, next).then(next).catch(next);
}
function addStoreItemFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        const createSchema = Joi.object().keys({
            itemType: Joi.string().required(),
            name: Joi.string().required(),
            quantity: Joi.number().required(),
            comments: Joi.any(),
            issueDate: Joi.any(),
            submitDate: Joi.any(),
            assignedTo: Joi.any(),
            labId: Joi.any()
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
            // await StoreItem.findOne({ $and: [{ storeItem: formData.storeItem }, { isDelete: false }] }).then(storeItemData => {
            //     if (!storeItemData) {
                    StoreItem.countDocuments()
                        .then(total => {
                            var storeItem = StoreItem()
                            storeItem.storeItemAutoId = total + 1
                            storeItem.itemType = formData.itemType
                            storeItem.name = formData.name
                            storeItem.quantity = formData.quantity
                            if(!!formData.inUse) storeItem.inUse = formData.inUse
                            if(!!formData.comments) storeItem.comments = formData.comments
                            storeItem.issueDate = formData.issueDate
                            storeItem.submitDate = formData.submitDate
                            storeItem.assignedTo = formData.assignedTo
                            storeItem.labId = formData.labId
                            if (req.decoded.addedById) storeItem.addedById = req.decoded.addedById
                            storeItem.save()
                                .then(saveRes => {
                                    resolve({
                                        status: 200, success: true, message: "StoreItem added successfully.", data: saveRes
                                    })
                                }).catch(err => {
                                    // helper.unlinkImage(req.file)
                                    reject({ success: false, status: 500, message: err })
                                })

                //         })
                // } else {
                //     // helper.unlinkImage(req.file)
                //     reject({ success: false, status: 422, message: "StoreItem already exists" })
                // }

            })
        }
    })
}
async function fetchStoreItemById(req, res, next) {
    await fetchStoreItemByIdFun(req, next).then(next).catch(next);
};
function fetchStoreItemByIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                var finder = { $and: [formData] };
                StoreItem.findOne(finder)
                    .populate('assignedTo')
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Single StoreItem Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("StoreItem not found");
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
async function updateStoreItem(req, res, next) {
    await updateStoreItemFun(req).then(next).catch(next);
};
function updateStoreItemFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                StoreItem.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("StoreItem not found");
                        else {
                            if (!!formData.itemType) res.itemType = formData.itemType
                            if (!!formData.name) res.name = formData.name
                            if (!!formData.quantity) res.quantity = formData.quantity
                            if (!!formData.inUse) res.inUse = formData.inUse
                            if (!!formData.comments) res.comments = formData.comments
                            if (!!formData.issueDate) res.issueDate = formData.issueDate
                            if (!!formData.submitDate) res.submitDate = formData.submitDate
                            if (!!formData.assignedTo) res.assignedTo = formData.assignedTo
                            if (!!formData.labId) res.labId = formData.labId
                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                            
                            res.updatedAt = new Date();
                            
                            res.save()
                            .then(res => {
                                {
                                    resolve({
                                        status: 200,
                                        success: true,
                                        message: "StoreItem Updated Successfully",
                                        data: res
                                    })
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
async function deleteStoreItem(req, res, next) {
    await deleteStoreItemFun(req).then(next).catch(next);
};
function deleteStoreItemFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            StoreItem.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("StoreItem not found");
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
                                        message: "StoreItem deleted Successfully"
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