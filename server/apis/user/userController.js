const User = require('./userModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const db = require('../../config/db')
const Joi = require('joi')
let salt = bcrypt.genSaltSync(10);

module.exports = {
    login,
    changePassword,
    index,
    fetchUserById,
    addUser,
    updateUser,
    deleteUser,
    enableDisableUser
}

async function login(req, res, next) {
    await loginFun(req, next).then(next).catch(next)
};
function loginFun(req, next) {
    const body = req.body
    const loginSchema = Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required()
    }).unknown(true);
    const result = loginSchema.validate(body)
    const { value, error } = result;
    const valid = error == null
    return new Promise(async (resolve, reject) => {
        if (!valid) {
            const { details } = error;
            reject({
                status: 400,
                success: false,
                message: details.map(i => i.message).join(',')
            });
        } else {
            let finder = {}
            if (!!body.email)
                finder = { email: body.email.toLowerCase() }
            User.findOne(finder).populate("role").then(res => {
                if (!!res) {
                    if (!bcrypt.compareSync(body.password, res.password)) {
                        reject("Invalid Username Password")
                    }
                    else {
                        if (res.isBlocked == false) {
                            let user = {
                                name: res.name, email: res.email, isAdmin: res.isAdmin, _id: res._id
                            }
                            const token = jwt.sign(user, process.env.SECRET)
                            resolve({
                                token: token,
                                status: 200,
                                success: true,
                                message: "Login Sucessful",
                                data: res
                            });

                        } else {
                            reject("User is Blocked! Contact Admin");
                        }
                    }
                } else {
                    reject("User does not exist");
                }
            }).catch(next)
        }

    })
}
async function changePassword(req, res, next) {
    await changePasswordFun(req, next).then(next).catch(next)
};
function changePasswordFun(req, next) {
    const body = req.body
    const loginSchema = Joi.object().keys({
        _id: Joi.string().required(),
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required()
    }).unknown(true);
    const result = loginSchema.validate(body)
    const { value, error } = result;
    const valid = error == null
    return new Promise(async (resolve, reject) => {
        if (!valid) {
            const { details } = error;
            reject({
                status: 400,
                success: false,
                message: details.map(i => i.message).join(',')
            });
        } else {

            User.findOne({ _id: body._id }).then(res => {
                if (!!res) {
                    if (!bcrypt.compareSync(body.oldPassword, res.password)) {
                        reject("Current Password does not match")
                    }
                    else {
                        if (res.isBlocked == false) {

                            res.password = bcrypt.hashSync(body.newPassword, salt)
                            res.save()
                            .then(saved=>{
                                resolve({
                                    status: 200,
                                    success: true,
                                    message: "Password Updated",
                                    data: res
                                });
                            })
                            .catch(next)
                        } else {
                            reject("User is Blocked! Contact Admin");
                        }
                    }
                } else {
                    reject("User does not exist");
                }
            }).catch(next)
        }

    })
}

async function index(req, res, next) {
    await indexFun(req, next).then(next).catch(next);
};
function indexFun(req, next) {
    return new Promise((resolve, reject) => {
        let lim = 100000;
        let skip1 = 0;
        let formData = {}
        if (!!req.body)
            formData = req.body
        else formData = req
        formData.isDelete = false
        if (formData.startpoint != undefined) {
            skip1 = parseInt(formData.startpoint)
            lim = 10;
            delete formData.startpoint
        }
        let find = { $and: [formData] }
        User.find(find)
            .skip(skip1)
            .limit(lim)
            .populate('role')
            .exec()
            .then(async alldocuments => {
                let total = 0
                total = await User.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All Users Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}

async function addUser(req, res, next) {
    await addUserFun(req, next)
        .then(next)
        .catch(next);

}
function addUserFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        const createSchema = Joi.object().keys({
            name: Joi.string().required(),
            phone: Joi.string().required(),
            email: Joi.string().required(),
            password: Joi.string().required(),
            employeeId: Joi.string().required(),
            role: Joi.string().required(),
            assignedCompanies:Joi.array().required()
        }).unknown(true);
        const result = createSchema.validate(formData)
        const { value, error } = result
        const valid = error == null
        if (!valid) {
            const { details } = error;
            reject({
                status: 400,
                success: false,
                message: details.map(i => i.message).join(',')
            });
        } else {
            await User.findOne({ $and: [{ email: formData.email }, { isDelete: false }] }).then(userData => {
                if (!userData) {
                    User.countDocuments()
                        .then(total => {
                          console.log(formData);
                            let user = User()
                            user.userAutoId = total + 1
                            user.name = formData.name
                            user.phone = formData.phone
                            user.email = formData.email.toLowerCase()
                            user.role = formData.role
                            user.employeeId = formData.employeeId
                            user.password = bcrypt.hashSync(formData.password, salt);
                            user.assignedCompanies = formData.assignedCompanies;
                            if (!!req.decoded.addedById) user.addedById = req.decoded.addedById
                            user.save()
                                .then(saveRes => {
                                    resolve({
                                        status: 200, success: true, message: "User added successfully.", data: saveRes
                                    })
                                }).catch(err => {
                                    reject({ success: false, status: 500, message: err })
                                })
                        })
                } else {
                    reject("User already exists with same email/phone")
                }

            })
        }
    })
}

async function fetchUserById(req, res, next) {
    await fetchUserByIdFun(req, next).then(next).catch(next);
};
function fetchUserByIdFun(req, next) {
    return new Promise(async (resolve, reject) => {
        if (req.body != undefined && req.body._id != undefined) {
            if (db.isValid(req.body._id)) {
                let finder = { $and: [req.body] };
                User.findOne(finder)
                    .exec()
                    .then(document => {
                        if (!!document) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Single User Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("User not found");
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

async function updateUser(req, res, next) {
    await updateUserFun(req, next).then(next).catch(next);
};
function updateUserFun(req, next) {
    let formData = req.body
    let isValidated = true
    return new Promise((resolve, reject) => {
        if (req.body != undefined && req.body._id != undefined) {
            if (db.isValid(req.body._id)) {
                User.findOne({ "_id": req.body._id })
                    .then(async res => {
                        if (!res) {
                            reject("User not found");
                        }
                        else {
                          console.log(formData);
                            if (!!formData.name) res.name = formData.name
                            if (!!formData.email) res.email = formData.email.toLowerCase()
                            if (!!formData.phone) res.phone = formData.phone
                            if (!!formData.password) res.password = bcrypt.hashSync(formData.password, 10);
                            if (!!formData.role) res.role = formData.role;
                            if (!!formData.employeeId) res.employeeId = formData.employeeId;
                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById;
                            if(!!formData.assignedCompanies) res.assignedCompanies = formData.assignedCompanies;

                            let id = res._id
                            if (!!formData.email) {
                                await User.findOne({ $and: [{ email: formData.email }, { isDelete: false }, { _id: { $ne: id } }] }).then(existingUser => {
                                    if (existingUser != null)
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
                                                message: "User Updated Successfully",
                                                data: res
                                            })
                                        }
                                    })
                                    .catch(next)
                            } else {
                                reject("User exists with same email")
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

async function deleteUser(req, res, next) {
    await deleteUserFun(req, next).then(next).catch(next);
};
function deleteUserFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (!!formData != undefined) {
            User.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("User not found");
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
                                        message: "User deleted Successfully"
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
async function enableDisableUser(req, res, next) {
    await enableDisableUserFun(req, next).then(next).catch(next);
};
function enableDisableUserFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (!!formData != undefined) {
            User.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("User not found");
                    else {
                        res.isBlocked = formData.isBlocked
                        res.updatedAt = new Date();
                        if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                        res.save()
                            .then(res => {
                                {
                                    resolve({
                                        status: 200,
                                        success: true,
                                        message: "User status changed Successfully"
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
