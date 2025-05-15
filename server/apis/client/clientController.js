const Client = require('./clientModel')
const SessionYear = require('../sessionYear/sessionYearModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')


module.exports = {
    index,
    fetchClientById,
    addClient,
    updateClient,
    deleteClient
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
        if (req.headers != undefined && req.headers.sessionyearid != undefined && db.isValid(req.headers.sessionyearid)) {
            formData.sessionYearId = req.headers.sessionyearid
        }
        var find = { $and: [formData] }
        if (formData.search != undefined) {
            search = formData.search.trim()
            find = {
                $and: [ { name: { $regex:search, $options: 'i' } }, find]
            }
            delete formData.search
        }
        Client.find(find)
            .skip(skip1)
            .limit(lim)
            .exec()
            .then(async alldocuments => {
                var total = 0
                total = await Client.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All Clients Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}
async function addClient(req, res, next) {
    await addClientFun(req, next).then(next).catch(next);
}
function addClientFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        const createSchema = Joi.object().keys({
            name: Joi.string().required(),
            administrator: Joi.string().required(),
            phone: Joi.string().required(),
            email: Joi.string().required(),
            dob: Joi.string().required(),
            address: Joi.string().required(),
            location: Joi.string().required(),
            gstNo: Joi.string().required(),
            companyName: Joi.string().required()
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
            await Client.findOne({ $and: [{ client: formData.client }, { isDelete: false }] }).then(clientData => {
                if (!clientData) {
                    Client.countDocuments()
                        .then(async total => {
                            var client = Client()
                            client.clientAutoId = total + 1
                            client.name = formData.name
                            client.administrator = formData.administrator
                            client.phone = formData.phone
                            client.email = formData.email
                            client.dob = formData.dob
                            client.address = formData.address
                            client.location = formData.location
                            client.gstNo = formData.gstNo
                            client.companyName = formData.companyName
                            let session = await SessionYear.findOne({isActive:true})
                            if(!!session && !!req.headers.sessionyearid) client.sessionYearId = session._id
                            
                            if (req.decoded.addedById) client.addedById = req.decoded.addedById
                            client.save()
                                .then(saveRes => {
                                    resolve({
                                        status: 200, success: true, message: "Client added successfully.", data: saveRes
                                    })
                                }).catch(err => {
                                    // helper.unlinkImage(req.file)
                                    reject({ success: false, status: 500, message: err })
                                })

                        })
                } else {
                    // helper.unlinkImage(req.file)
                    reject({ success: false, status: 422, message: "Client already exists" })
                }

            })
        }
    })
}
async function fetchClientById(req, res, next) {
    await fetchClientByIdFun(req, next).then(next).catch(next);
};
function fetchClientByIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                var finder = { $and: [formData] };
                Client.findOne(finder)
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Single Client Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("Client not found");
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

async function updateClient(req, res, next) {
    await updateClientFun(req).then(next).catch(next);
};
function updateClientFun(req, next) {
    let formData = req.body
    let isValidated = true
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                Client.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("Client not found");
                        else {
                            if (!!formData.name) res.name = formData.name
                            if (!!formData.administrator) res.administrator = formData.administrator
                            if (!!formData.phone) res.phone = formData.phone
                            if (!!formData.email) res.email = formData.email
                            if (!!formData.dob) res.dob = formData.dob
                            if (!!formData.address) res.address = formData.address
                            if (!!formData.location) res.location = formData.location
                            if (!!formData.gstNo) res.gstNo = formData.gstNo
                            if (!!formData.companyName) res.companyName = formData.companyName

                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                            let id = res._id
                            if (!!formData.client) {
                                await Client.findOne({ $and: [{ client: formData.client }, { isDelete: false }, { _id: { $ne: id } }] }).then(existingClient => {
                                    if (existingClient != null)
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
                                                message: "Client Updated Successfully",
                                                data: res
                                            })
                                        }
                                    })
                                    .catch(next)
                            } else {
                                reject("Client already exists")
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
async function deleteClient(req, res, next) {
    await deleteClientFun(req).then(next).catch(next);
};
function deleteClientFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            Client.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("Client not found");
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
                                        message: "Client deleted Successfully"
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