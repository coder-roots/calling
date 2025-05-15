const Employee = require('./employeeModel')
const Joi = require('joi')
const helper = require('../../utilities/helper')
const db = require('../../config/db')


module.exports = {
    index,
    fetchEmployeeById,
    addEmployee,
    addEmployeeMultiple,
    updateEmployee,
    deleteEmployee,
    changeStatusEmployee
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
        if (formData.search != undefined) {
            search = formData.search.trim()
            find = {
                $and: [ { name: { $regex:search, $options: 'i' } }, find]
            }
            delete formData.search
        }
        Employee.find(find)
            .skip(skip1)
            .limit(lim)
            .sort({createdAt:-1})
            .populate('supervisor')
            .exec()
            .then(async alldocuments => {
                var total = 0
                total = await Employee.countDocuments(find)
                resolve({
                    status: 200,
                    success: true,
                    total: total,
                    message: "All Employees Loaded",
                    data: alldocuments
                });
            })
            .catch(next)
    });
}
async function addEmployee(req, res, next) {
    await addEmployeeFun(req, next).then(next).catch(next);
}
function addEmployeeFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        // console.log(formData);
        const createSchema = Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required(),
            image: Joi.string().required(),
            trimImage: Joi.string().required(),
            contact: Joi.string().required(),
            // familyContact:Joi.string().required(),
            birthDate:Joi.date().required(),
            address: Joi.string().required(),
            aadharCard: Joi.string().required(),
            panNo: Joi.string().required(),
            // specialInterests:Joi.any(),
            learningInstitutions:Joi.any(),

            maritalStatus: Joi.string().required(),
            spouseName: Joi.any(),
            spouseEmployer: Joi.any(),

            jobTitle: Joi.string().required(),
            joiningDate:Joi.date().required(),
            employeeId:Joi.string().required(),
            department:Joi.string().required(),
            supervisor:Joi.string().required(),
            workLocation:Joi.any(),
            workEmail:Joi.string().required(),
            // workNumber:Joi.any(),
            startDateSalary:Joi.any(),

            personName:Joi.any(),
            personAddress: Joi.any(),
            personContact:Joi.any(),
            relationship:Joi.any(),
            healthCondition:Joi.any(),
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
            await Employee.findOne({ $and: [{ email: formData.email }, { isDelete: false }] }).then(employeeData => {
                if (!employeeData) {

                    Employee.countDocuments()
                        .then(total => {
                            var employee = Employee()
                            employee.employeeAutoId = total + 1
                            employee.name = formData.name
                            employee.email = formData.email
                            employee.contact = formData.contact
                            // employee.familyContact = formData.familyContact
                            employee.birthDate = formData.birthDate
                            employee.address = formData.address
                            employee.aadharCard = formData.aadharCard
                            employee.panNo = formData.panNo
                            employee.image = "employee/" + formData.image
                            employee.trimImage = "employee/" + formData.trimImage
                            // if(!!formData.specialInterests) employee.specialInterests = formData.specialInterests
                            if(!!formData.learningInstitutions){ 
                                if(typeof formData.learningInstitutions == 'string')
                                employee.learningInstitutions = JSON.parse(formData.learningInstitutions)
                                else 
                                employee.learningInstitutions = formData.learningInstitutions
                            }
                            employee.maritalStatus = formData.maritalStatus
                            if(!!formData.spouseName) employee.spouseName = formData.spouseName
                            if(!!formData.spouseEmployer) employee.spouseEmployer = formData.spouseEmployer
                            
                            employee.jobTitle = formData.jobTitle
                            employee.joiningDate = formData.joiningDate
                            employee.employeeId = formData.employeeId
                            employee.department = formData.department
                            employee.supervisor = formData.supervisor
                            employee.workLocation = formData.workLocation
                            if(!!formData.workEmail) employee.workEmail = formData.workEmail
                            // if(!!formData.workNumber) employee.workNumber = formData.workNumber
                            if(!!formData.startDateSalary) employee.startDateSalary = formData.startDateSalary

                            if(!!formData.personName) employee.personName = formData.personName
                            if(!!formData.personAddress) employee.personAddress = formData.personAddress
                            if(!!formData.personContact) employee.personContact = formData.personContact
                            if(!!formData.relationship) employee.relationship = formData.relationship
                            if(!!formData.healthCondition) employee.healthCondition = formData.healthCondition
 
                            if (req.decoded.addedById) employee.addedById = req.decoded.addedById
                            employee.save()
                                .then(saveRes => {
                                    resolve({
                                        status: 200, success: true, message: "Employee added successfully.", data: saveRes
                                    })
                                }).catch(err => {
                                    helper.unlinkImage(req.file)
                                    reject({ success: false, status: 500, message: err })
                                })

                        })
                } else {
                    helper.unlinkImage(req.file)
                    reject({ success: false, status: 422, message: "Employee already exists with same email" })
                }

            })
        }
    })
}
async function addEmployeeMultiple(req, res, next) {
    await addEmployeeMultipleFun(req, next).then(next).catch(next);
}
function addEmployeeMultipleFun(req, next) {
    return new Promise(async (resolve, reject) => {
        const formData = req.body
        // console.log(formData);
        const createSchema = Joi.object().keys({
           empArray:Joi.any().required()
        });
        const result = createSchema.validate(formData)
        const { value, error } = result
        const valid = error == null
        if (!valid) {
            const { details } = error;
            // helper.unlinkImage(req.file)
            reject({  
                status: 400,
                success: false,
                message: details.map(i => i.message).join(',')
            });
        } else {
            let empArray = []
            if(typeof formData.empArray == 'string')
                empArray = JSON.parse(formData.empArray)
            else empArray = formData.empArray

            if(empArray.length == 0)
                reject("No Data Found")
            else{
                let totalEmp = empArray.length
                for(let i in empArray){
                    // console.log(i);
                    let emp = empArray[i]
                    await Employee.findOne({ $and: [{ email: emp.email }, { isDelete: false }] }).then(employeeData => {
                        if (!employeeData) {
                            Employee.countDocuments()
                                .then(async total => {
                                    var employee = Employee()
                                    employee.employeeAutoId = total + Number(i) + 1
                                    employee.name = emp.name
                                    employee.email = emp.email
                                    employee.contact = emp.contact
                                    employee.birthDate = emp.birthDate
                                    employee.address = emp.address
                                    employee.aadharCard = emp.aadharCard
                                    employee.panNo = emp.panNo
                                    employee.maritalStatus = emp.maritalStatus
                                    if(!!emp.spouseName) employee.spouseName = emp.spouseName
                                    if(!!emp.spouseEmployer) employee.spouseEmployer = emp.spouseEmployer
                                    
                                    employee.jobTitle = emp.jobTitle
                                    employee.joiningDate = emp.joiningDate
                                    employee.employeeId = emp.employeeId
                                    employee.department = emp.department
                                    let supervisor = await Employee.findOne({ employeeAutoId:Number(emp.supervisor) })
                                    employee.supervisor = supervisor._id
                                    employee.workLocation = emp.workLocation

                                    if(!!emp.workEmail) employee.workEmail = emp.workEmail
                                    if(!!emp.startDateSalary) employee.startDateSalary = emp.startDateSalary
        
                                    if(!!emp.personName) employee.personName = emp.personName
                                    if(!!emp.personAddress) employee.personAddress = emp.personAddress
                                    if(!!emp.personContact) employee.personContact = emp.personContact
                                    if(!!emp.relationship) employee.relationship = emp.relationship
                                    if(!!emp.healthCondition) employee.healthCondition = emp.healthCondition

                                    if(!!emp.learningInstitutions){ 
                                        if(typeof emp.learningInstitutions == 'string')
                                        employee.learningInstitutions = JSON.parse(emp.learningInstitutions)
                                        else 
                                        employee.learningInstitutions = emp.learningInstitutions
                                    }
                                    // if(!!emp.course && !!emp.institution)
                                    // employee.learningInstitutions = [ {
                                    //     course : emp.course,
                                    //     institution : emp.institution
                                    // }]

                                    if (req.decoded.addedById) employee.addedById = req.decoded.addedById
                                    employee.save()
                                        .then(saveRes => {
                                            if(totalEmp-1 == i){
                                                resolve({
                                                    status: 200, success: true, message: "Employee added successfully.", data: saveRes
                                                })
                                            }
                                        }).catch(next)
                                })
                        } else {
                            helper.unlinkImage(req.file)
                            reject({ success: false, status: 422, message: "Employee already exists with same email" })
                        }
        
                    })
                }
            }
           
        }
    })
}
async function fetchEmployeeById(req, res, next) {
    await fetchEmployeeByIdFun(req, next).then(next).catch(next);
};
function fetchEmployeeByIdFun(req, next) {
    let formData = req.body
    return new Promise(async (resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                var finder = { $and: [formData] };
                Employee.findOne(finder)
                .populate('supervisor')
                    .exec()
                    .then(document => {
                        if (document != null) {
                            resolve({
                                status: 200,
                                success: true,
                                message: "Single Employee Loaded",
                                data: document
                            });
                        }
                        else {
                            reject("Employee not found");
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
async function updateEmployee(req, res, next) {
    await updateEmployeeFun(req).then(next).catch(next);
};
function updateEmployeeFun(req, next) {
    // console.log(req.body);
    let formData = req.body
    let isValidated = true
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            if (db.isValid(formData._id)) {
                Employee.findOne({ "_id": formData._id })
                    .then(async res => {
                        if (!res)
                            reject("Employee not found");
                        else {
                            if (!!formData.name) res.name = formData.name
                            if (!!formData.email) res.email = formData.email 
                            if (!!formData.contact) res.contact = formData.contact 
                            // if (!!formData.familyContact) res.familyContact = formData.familyContact 
                            if (!!formData.birthDate) res.birthDate = formData.birthDate
                            if (!!formData.address) res.address = formData.address
                            if (!!formData.aadharCard) res.aadharCard = formData.aadharCard
                            if (!!formData.panNo) res.panNo = formData.panNo
                            if (!!formData.image) {
                                helper.unlinkImageUsingPath("server/public/"+res.image)
                                res.image = "employee/" + formData.image;
                            }
                            if (!!formData.trimImage) {
                                helper.unlinkImageUsingPath("server/public/"+res.trimImage)
                                res.trimImage = "employee/" + formData.trimImage;
                            }
                            // if(!!formData.specialInterests) res.specialInterests = formData.specialInterests
                            if(!!formData.learningInstitutions){ 
                                if(typeof formData.learningInstitutions == 'string')
                                res.learningInstitutions = JSON.parse(formData.learningInstitutions)
                                else
                                res.learningInstitutions = formData.learningInstitutions
                            }

                            if (!!formData.maritalStatus) res.maritalStatus = formData.maritalStatus
                            if (!!formData.spouseName) res.spouseName = formData.spouseName
                            if (!!formData.spouseEmployer) res.spouseEmployer = formData.spouseEmployer

                            if (!!formData.jobTitle) res.jobTitle = formData.jobTitle 
                            if (!!formData.joinedDate) res.joinedDate = formData.joinedDate
                            if (!!formData.employeeId) res.employeeId = formData.employeeId
                            if (!!formData.department) res.department = formData.department
                            if (!!formData.supervisor) res.supervisor = formData.supervisor
                            if (!!formData.workLocation) res.workLocation = formData.workLocation
                            if (!!formData.workEmail) res.workEmail = formData.workEmail
                            // if (!!formData.workNumber) res.workNumber = formData.workNumber
                            if (!!formData.startDateSalary) res.startDateSalary = formData.startDateSalary

                            if(!!formData.personName) res.personName = formData.personName
                            if(!!formData.personAddress) res.personAddress = formData.personAddress
                            if(!!formData.personContact) res.personContact = formData.personContact
                            if(!!formData.relationship) res.relationship = formData.relationship
                            if(!!formData.healthCondition) res.healthCondition = formData.healthCondition
                           
                            if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                            let id = res._id
                            if (!!formData.name) {
                                await Employee.findOne({ $and: [{ email: formData.email }, { isDelete: false }, { _id: { $ne: id } }] }).then(existingEmployee => {
                                    if (existingEmployee != null)
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
                                                message: "Employee Updated Successfully",
                                                data: res
                                            })
                                        }
                                    })
                                    .catch(next)
                            } else {
                                reject("Employee exists with same email")
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
async function deleteEmployee(req, res, next) {
    await deleteEmployeeFun(req).then(next).catch(next);
};
function deleteEmployeeFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined) {
            Employee.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("Employee not found");
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
                                        message: "Employee deleted Successfully"
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
async function changeStatusEmployee(req, res, next) {
    await changeStatusEmployeeFun(req).then(next).catch(next);
};
function changeStatusEmployeeFun(req, next) {
    let formData = req.body
    return new Promise((resolve, reject) => {
        if (formData != undefined && formData._id != undefined && formData.status != undefined) {
            Employee.findOne({ "_id": formData._id })
                .then(async res => {
                    if (!res)
                        reject("Employee not found");
                    else {
                        res.status = formData.status
                        res.updatedAt = new Date();
                        if (!!req.decoded.updatedById) res.updatedById = req.decoded.updatedById
                        res.save()
                            .then(res => {
                                {
                                    resolve({
                                        status: 200,
                                        success: true,
                                        message: "Employee status changed Successfully"
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