const mongoose = require('mongoose')

var employeeSchema = mongoose.Schema({
    employeeAutoId: { type: Number, default: 0 },
    // personal Information
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    contact: { type: String, default: '' },
    // familyContact: { type: String, default: '' },
    birthDate: { type: Date, default: Date.now },
    address: { type: String, default: '' },
    aadharCard:{ type:String, default:''},
    panNo:{ type:String, default:''},
    image: { type: String, default: 'employee/noImg.png' },
    trimImage: { type: String, default: 'employee/noImg.png' },
    // specialInterests:{type:String, default:''},
    learningInstitutions:[{
        course:{type:String, default:'' },
        institution:{type:String, default:''}
    }],


    maritalStatus: { type: String, default: 'Unmarried' }, // Unmarried, Married
    spouseName:{ type:String, default:''}, // if married
    spouseEmployer:{ type:String, default:''}, // if married


    // job info
    jobTitle: { type: String, default: '' },
    employeeId:{type:String, default:''},
    department:{ type:String, default:''},
    supervisor:{ type:mongoose.Schema.Types.ObjectId, default:null, ref:'employee'},
    workLocation:{type:String, default:''},
    workEmail:{type:String, default:''},
    // workNumber:{type:String, default:''},
    startDateSalary:{ type:String, default:''},
    joiningDate: { type: Date, default: Date.now },

    
    //emergency contact
    personName:{type:String, default:''},
    personAddress: { type:String, default:''},
    personContact:{ type:String, default:''},
    relationship:{type:String, default:''},
    healthCondition:{type:String, default:''},

    isDelete: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    updatedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true }//active employee for true and former employee for false 
})

module.exports = mongoose.model('employee', employeeSchema)
