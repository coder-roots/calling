const mongoose = require('mongoose')



var studentSchema = mongoose.Schema({
    studentAutoId: { type: Number, default: 0 },
    studentName: { type: String, default: '' },
    email : { type: String, default : 0},
    personalContact : { type: String, default : ''},
    parentsContact : { type: String, default : ''},
    address :{type:String, default:''},
    fatherName:{type:String, default:''},
    college:{type:mongoose.Schema.Types.ObjectId, default:null, ref:'college'},
    collegeCourse:{type:String, default:''},
    // qualifications : [{
    //     institute : { type: String, default: ''},
    //     course : { type: String, default: ''},
    //     sem : { type:Number, default: ''},
    //     isPassout : { type: Boolean, default: false },
    // }],                                                             
    isDelete: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    updatedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    sessionYearId: {type:mongoose.Schema.Types.ObjectId, default:null, ref:'sessionYear'},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true },
    company :{type:String, default:''},
})

module.exports = mongoose.model('student', studentSchema)
