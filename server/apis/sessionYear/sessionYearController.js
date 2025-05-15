const SessionYear = require('./sessionYearModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')


module.exports = {
    index,
    fetchSessionYearById,
    addSessionYear,
    updateSessionYear,
    updateActiveStatus,
    deleteSessionYear
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

        SessionYear.find(find)
            .skip(skip1)
            .limit(lim)
            .populate('addedById')
            .exec()
            .then(async alldocuments => {
                var total = 0
                total = await SessionYear.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All SessionYears Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}
async function addSessionYear(req, res, next) {
    await addSessionYearFun(req, next).then(next).catch(next);
}
function addSessionYearFun(req, next) {
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
            await SessionYear.findOne({ $and: [{ name: formData.name }, { isDelete: false }] }).then(sessionYearData => {
                if (!sessionYearData) {
                    SessionYear.countDocuments()
                        .then(total => {
                            var sessionYear = SessionYear()
                            sessionYear.sessionYearAutoId = total + 1
                            sessionYear.name = formData.name
                            if (req.decoded.addedById) sessionYear.addedById = req.decoded.addedById
                            sessionYear.save()
                                .then(saveRes => {
                                    resolve({
                                        status: 200, success: true, message: "SessionYear added successfully.", data: saveRes
                                    })
                                }).catch(err => {
                                    // helper.unlinkImage(req.file)
                                    reject({ success: false, status: 500, message: err })
                                })

                        })
                } else {
                    // helper.unlinkImage(req.file)
                    reject({ success: false, status: 422, message: "SessionYear already exists" })
                }

            })
        }
    })
}
async function fetchSessionYearById(req, res, next) {
    await fetchSessionYearByIdFun(req, next).then(next).catch(next);
};
function fetchSessionYearByIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                var finder = { $and: [formData] };
                SessionYear.findOne(finder)
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Single SessionYear Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("SessionYear not found");
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
async function updateSessionYear(req, res, next) {
    await updateSessionYearFun(req).then(next).catch(next);
};
function updateSessionYearFun(req, next) {
    let formData = req.body
    let isValidated = true
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                SessionYear.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("SessionYear not found");
                        else {
                            if (!!formData.name) res.name = formData.name
                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                            let id = res._id
                            if (!!formData.name) {
                                await SessionYear.findOne({ $and: [{ name: formData.name }, { isDelete: false }, { _id: { $ne: id } }] }).then(existingSessionYear => {
                                    if (existingSessionYear != null)
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
                                                message: "SessionYear Updated Successfully",
                                                data: res
                                            })
                                        }
                                    })
                                    .catch(next)
                            } else {
                                reject("SessionYear already exists")
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
async function updateActiveStatus(req, res, next) {
    await updateActiveStatusFun(req).then(next).catch(next);
};
function updateActiveStatusFun(req, next) {
    let formData = req.body
    
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                SessionYear.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("SessionYear not found");
                        else {
                            res.isActive = true
                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                            
                           
                            res.save()
                                .then(res => {
                                    {
                                        // console.log("Changed Obj", res);
                                        SessionYear.find({_id:{$ne:formData._id}}).exec()
                                        .then(async data=>{
                                            // console.log();
                                            let length = data.length
                                            for(let i in data){
                                                let obj = data[i]
                                                obj.isActive = false
                                                await obj.save().then(saved=>{
                                                    if(length -1 == i)
                                                        resolve({
                                                            status: 200,
                                                            success: true,
                                                            message: "SessionYear Updated Successfully",
                                                            data: res
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
async function deleteSessionYear(req, res, next) {
    await deleteSessionYearFun(req).then(next).catch(next);
};
function deleteSessionYearFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            SessionYear.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("SessionYear not found");
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
                                        message: "SessionYear deleted Successfully"
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