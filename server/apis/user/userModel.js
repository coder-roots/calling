const mongoose = require('mongoose')

var userSchema = mongoose.Schema({
    userAutoId: { type: Number, default: 0 },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: 0 },

    userType: { type: Number, default: 2 },
    password: { type: String, default: '' },
    employeeId:{ type:mongoose.Schema.Types.ObjectId, default:null, ref:'employee'},
    role: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'role' },

    isDelete: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    updatedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true },
    assignedCompanies: [{type:String,default:null}]
})

module.exports = mongoose.model('user', userSchema)
