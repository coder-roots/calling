const CallSheetDetail = require('./callSheetDetailModel')
const SessionYear = require('../sessionYear/sessionYearModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')


module.exports = {
    index,
    fetchCallSheetDetailById,
    addCallSheetDetail,
    updateCallSheetDetail,
    deleteCallSheetDetail
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

        CallSheetDetail.find(find)
            .skip(skip1)
            .limit(lim)
            .populate('callSheetId')
            .exec()
            .then(async alldocuments => {
                var total = 0
                total = await CallSheetDetail.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All CallSheetDetails Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}
async function addCallSheetDetail(req, res, next) {
    await addCallSheetDetailFun(req, next).then(next).catch(next);
}
function addCallSheetDetailFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        const createSchema = Joi.object().keys({
            _id:Joi.string().required(),
            callStatus: Joi.string().required(),
            callDate: Joi.any().required(),
            callerName: Joi.string().required()
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
            await CallSheetDetail.findOne({ "_id": formData._id }).then(callData => {
                if (!!callData) {
                    callData.callerName = formData.callerName
                    callData.callStatus = formData.callStatus
                    callData.callDate = formData.callDate
                    let obj= {
                        callerName:callData.callerName,
                        callDate:callData.callDate,
                        callStatus:callData.callStatus
                    }
                    callData.callHistory.push(obj)
                    callData.callCount = callData.callHistory.length
                    if (req.decoded.addedById) callData.addedById = req.decoded.addedById
                    callData.save()
                        .then(saveRes => {
                            resolve({
                                status: 200, success: true, message: "CallSheetDetail added successfully.", data: saveRes
                            })
                        }).catch(next)
                } else {
                    // helper.unlinkImage(req.file)
                    reject({ success: false, status: 422, message: "CallSheetDetail doesn't exists" })
                }

            })
            .catch(next)
        }
    })
}

async function fetchCallSheetDetailById(req, res, next) {
    await fetchCallSheetDetailByIdFun(req, next).then(next).catch(next);
};
function fetchCallSheetDetailByIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                var finder = { $and: [formData] };
                CallSheetDetail.findOne(finder)
                    .populate('callSheet')
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Single CallSheetDetail Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("CallSheetDetail not found");
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
async function updateCallSheetDetail(req, res, next) {
    await updateCallSheetDetailFun(req).then(next).catch(next);
};
function updateCallSheetDetailFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                CallSheetDetail.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("CallSheetDetail not found");
                        else {
                            if (!!formData.callerName) res.callerName = formData.callerName
                            if (!!formData.callStatus) res.callStatus = formData.callStatus
                            if (!!formData.callDate) res.callDate = formData.callDate
                            let obj= {
                                callerName:res.callerName,
                                callDate:res.callDate,
                                callStatus:res.callStatus
                            }
                            res.callHistory.push(obj)
                            res.callCount = res.callHistory.length

                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                            // let id = res._id
                            // if (!!formData.callSheetDetail) {
                            //     await CallSheetDetail.findOne({ $and: [{ callSheetDetail: formData.callSheetDetail }, { isDelete: false }, { _id: { $ne: id } }] }).then(existingCallSheetDetail => {
                            //         if (existingCallSheetDetail != null)
                            //             isValidated = false
                            //     })
                            // }
                            // res.updatedAt = new Date();
                            // if (isValidated) {
                                res.save()
                                    .then(res => {
                                        {
                                            resolve({
                                                status: 200,
                                                success: true,
                                                message: "Call Saved",
                                                data: res
                                            })
                                        }
                                    })
                                    .catch(next)
                            // } else {
                            //     reject("CallSheetDetail already exists")
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

async function deleteCallSheetDetail(req, res, next) {
    await deleteCallSheetDetailFun(req).then(next).catch(next);
};
function deleteCallSheetDetailFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            CallSheetDetail.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("CallSheetDetail not found");
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
                                        message: "CallSheetDetail deleted Successfully"
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