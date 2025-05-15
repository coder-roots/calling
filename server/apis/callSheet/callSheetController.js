const CallSheet = require('./callSheetModel')
const SessionYear = require('../sessionYear/sessionYearModel')
const CallSheetDetail = require('../callSheetDetail/callSheetDetailModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')


module.exports = {
    index,
    fetchCallSheetById,
    addCallSheet,
    updateCallSheet,
    deleteCallSheet
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
            formData.sheetDate = {$gt:start, $lt:end}
            delete formData.startDate
            delete formData.endDate
        }
        if (req.headers != undefined && req.headers.sessionyearid != undefined && db.isValid(req.headers.sessionyearid)) {
            formData.sessionYearId = req.headers.sessionyearid
        }
        var find = { $and: [formData] }

        CallSheet.find(find)
            .skip(skip1)
            .limit(lim)
            .sort({createdAt:-1})
            .populate('collegeId')
            .exec()
            .then(async alldocuments => {
                var total = 0
                total = await CallSheet.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All CallSheets Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}
async function addCallSheet(req, res, next) {
    await addCallSheetFun(req, next).then(next).catch(next);
}
function addCallSheetFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        const createSchema = Joi.object().keys({
            collegeId: Joi.string().required(),
            course: Joi.string().required(),
            semester: Joi.number().required(),
            attachment: Joi.string(),
            comments: Joi.string(),
            company: Joi.string().required(),
            sheetDate: Joi.any(),
            students:Joi.any().required()
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
            // await CallSheet.findOne({ $and: [{ callSheet: formData.callSheet }, { isDelete: false }] }).then(callSheetData => {
            //     if (!callSheetData) {
                    CallSheet.countDocuments()
                        .then(async total => {
                            var callSheet = CallSheet()
                            callSheet.callSheetAutoId = total + 1
                            callSheet.collegeId = formData.collegeId
                            callSheet.course = formData.course
                            callSheet.semester = formData.semester
                            callSheet.attachment  = "callSheet/" +formData.attachment 
                            callSheet.comments  = formData.comments 
                            callSheet.company  = formData.company 
                            callSheet.sheetDate  = formData.sheetDate 

                            let session = await SessionYear.findOne({isActive:true})
                            if(!!session && !!req.headers.sessionyearid) callSheet.sessionYearId = session._id
                            
                            if (req.decoded.addedById) callSheet.addedById = req.decoded.addedById
                            callSheet.save()
                                .then(async saveRes => {
                                    let students;
                                    if(typeof formData.students == 'string')
                                        students = JSON.parse(formData.students)
                                    else students = formData.students
                                    let total = await CallSheetDetail.countDocuments()
                                    let session = await SessionYear.findOne({isActive:true})
                                    for(let x of students)
                                    { 
                                        let callSheetDetailObj = new CallSheetDetail()
                                        callSheetDetailObj.callSheetDetailAutoId = ++total
                                        callSheetDetailObj.callSheetId = saveRes._id
                                        callSheetDetailObj.srNo = x['Sr No']
                                        callSheetDetailObj.rollNo = x['Roll No']
                                        callSheetDetailObj.studentName = x['Student Name']
                                        callSheetDetailObj.contactNo = x['Contact No']
                                        
                                        if(!!session && !!req.headers.sessionyearid) callSheetDetailObj.sessionYearId = session._id
                            
                                        await callSheetDetailObj.save()
                                    }

                                    CallSheetDetail.find({callSheetId:saveRes._id}).exec()
                                    .then(data=>{
                                        resolve({
                                            status: 200, success: true, message: "CallSheet added successfully.", data: saveRes,
                                            callSheetDetail:data
                                        })
                                    })
                                    .catch(next)
                                }).catch(err => {
                                    // helper.unlinkImage(req.file)
                                    reject({ success: false, status: 500, message: err })
                                })

                        })
                // } else {
                //     // helper.unlinkImage(req.file)
                //     reject({ success: false, status: 422, message: "CallSheet already exists" })
                // }

            // })
        }
    })
}
async function fetchCallSheetById(req, res, next) {
    await fetchCallSheetByIdFun(req, next).then(next).catch(next);
};
function fetchCallSheetByIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                var finder = { $and: [formData] };
                CallSheet.findOne(finder)
                    .populate('collegeId')
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Single CallSheet Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("CallSheet not found");
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
async function updateCallSheet(req, res, next) {
    await updateCallSheetFun(req).then(next).catch(next);
};
function updateCallSheetFun(req, next) {
    let formData = req.body
    let isValidated = true
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                CallSheet.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("CallSheet not found");
                        else {
                            if (!!formData.collegeId) res.collegeId = formData.collegeId
                            if (!!formData.course) res.course = formData.course
                            if (!!formData.semester) res.semester = formData.semester
                            if (!!formData.attachment) res.attachment = "callSheet/" + formData.attachment
                            if (!!formData.comments) res.comments = formData.comments
                            if (!!formData.company) res.company = formData.company
                            if (!!formData.sheetDate) res.sheetDate = formData.sheetDate
                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                            // let id = res._id
                            // if (!!formData.callSheet) {
                            //     await CallSheet.findOne({ $and: [{ callSheet: formData.callSheet }, { isDelete: false }, { _id: { $ne: id } }] }).then(existingCallSheet => {
                            //         if (existingCallSheet != null)
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
                                                message: "CallSheet Updated Successfully",
                                                data: res
                                            })
                                        }
                                    })
                                    .catch(next)
                            // } else {
                            //     reject("CallSheet already exists")
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
async function deleteCallSheet(req, res, next) {
    await deleteCallSheetFun(req).then(next).catch(next);
};
function deleteCallSheetFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            CallSheet.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("CallSheet not found");
                    else {
                        res.isDelete = true
                        res.updatedAt = new Date();
                        if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                        res.save()
                            .then(res => {
                                {
                                    CallSheetDetail.deleteMany({callSheetId:res._id})
                                    .then(()=>{
                                        resolve({
                                            status: 200,
                                            success: true,
                                            message: "CallSheet deleted Successfully"
                                        })
                                    })
                                    .catch(next)
                                    
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