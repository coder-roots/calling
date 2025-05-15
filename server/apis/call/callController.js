const Call = require('./callModel')
const SessionYear = require('../sessionYear/sessionYearModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')


module.exports = {
    index,
    fetchCallById,
    addCall,
    updateCall,
    deleteCall
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
        if(!!formData.startDate && !!formData.endDate){
            let start =new Date(formData.startDate)
            start.setHours(0,0,0,0)
            let end =new Date(formData.endDate)
            end.setHours(23,59,59,999)
            formData.createdAt = {$gt:start, $lt:end}
            delete formData.startDate
            delete formData.endDate
        }
        if (req.headers != undefined && req.headers.sessionyearid != undefined && db.isValid(req.headers.sessionyearid)) {
            formData.sessionYearId = req.headers.sessionyearid
        }
        if(!!formData.removeSession && formData.removeSession== 'true'){
            delete formData.sessionYearId
        }
        var find = { $and: [formData] }

        Call.find(find)
            .skip(skip1)
            .limit(lim)
            .populate({path:'enquiryId', populate:{path:'college technologies.course'}})
            .populate({path:'admissionId',populate:{path:'studentId college technologies.course'}})
            .sort({createdAt:-1})
            .exec()
            .then(async alldocuments => {
                var total = 0
                total = await Call.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All Calls Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}
async function addCall(req, res, next) {
    await addCallFun(req, next).then(next).catch(next);
}
function addCallFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        const createSchema = Joi.object().keys({
            isEnquiryCall: Joi.boolean().required(),
            enquiryId: Joi.any(),
            admissionId: Joi.any(),
            callerName: Joi.string().required(),
            callStatus: Joi.string().required()
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
            // await Call.findOne({ $and: [{ call: formData.call }, { isDelete: false }] }).then(callData => {
            //     if (!callData) {
                    Call.countDocuments()
                        .then(async total => { 
                            var call = new Call()
                            call.callAutoId = total + 1
                            if(!!formData.callerName) call.callerName = formData.callerName
                            call.callDate = Date.now()
                            call.callStatus = formData.callStatus
                            call.isEnquiryCall = formData.isEnquiryCall
                            if(!!formData.enquiryId) call.enquiryId = formData.enquiryId
                            if(!!formData.admissionId) call.admissionId = formData.admissionId
                            let session = await SessionYear.findOne({isActive:true})
                            if(!!session && !!req.headers.sessionyearid) call.sessionYearId = session._id
                            if (req.decoded.addedById) call.addedById = req.decoded.addedById
                            call.save()
                                .then(saveRes => {
                                    resolve({
                                        status: 200, success: true, message: "Call added successfully.", data: saveRes
                                    })
                                }).catch(err => {
                                    // helper.unlinkImage(req.file)
                                    reject({ success: false, status: 500, message: err })
                                })

                        })
                // } else {
                //     // helper.unlinkImage(req.file)
                //     reject({ success: false, status: 422, message: "Call already exists" })
                // }

            // })
        }
    })
}
async function fetchCallById(req, res, next) {
    await fetchCallByIdFun(req, next).then(next).catch(next);
};
function fetchCallByIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                var finder = { $and: [formData] };
                Call.findOne(finder)
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Single Call Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("Call not found");
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
async function updateCall(req, res, next) {
    await updateCallFun(req).then(next).catch(next);
};
function updateCallFun(req, next) {
    let formData = req.body
    let isValidated = true
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                Call.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("Call not found");
                        else {
                            if (!!formData.callerName) res.callerName = formData.callerName
                            if (!!formData.callDate) res.callDate = formData.callDate
                            if (!!formData.enquiryId) res.enquiryId = formData.enquiryId
                            if (!!formData.callStatus) res.callStatus = formData.callStatus
                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                            let id = res._id
                            if (!!formData.call) {
                                await Call.findOne({ $and: [{ call: formData.call }, { isDelete: false }, { _id: { $ne: id } }] }).then(existingCall => {
                                    if (existingCall != null)
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
                                                message: "Call Updated Successfully",
                                                data: res
                                            })
                                        }
                                    })
                                    .catch(next)
                            } else {
                                reject("Call already exists")
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
async function deleteCall(req, res, next) {
    await deleteCallFun(req).then(next).catch(next);
};
function deleteCallFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            Call.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("Call not found");
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
                                        message: "Call deleted Successfully"
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