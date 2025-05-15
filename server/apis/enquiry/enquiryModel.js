const mongoose = require('mongoose')

var enquirySchema = mongoose.Schema({
    enquiryAutoId: { type: Number, default: 0 },

    isNewStudent : { type: Boolean, default: true },
    studentId: { type:mongoose.Schema.Types.ObjectId, default:null, ref:'student' }, // if isNewStudent is false

    studentName: { type: String, default: '' },
    email : { type: String, default : ''},
    personalContact : { type: String, default : ''},
    parentsContact : { type: String, default : ''},

    isOfficialTraining : { type:Boolean, default:false },
    trainingType : { type:String, default:''},   // if official Training true : '6 months', '6 weeks'
    isPassout : { type:Boolean, default:false },
    college: { type:mongoose.Schema.Types.ObjectId, default: null, ref:'college'},
    collegeCourse : { type:String, default: '' },
    collegeCourseId : { type:mongoose.Schema.Types.ObjectId, default: null, ref:'collegeCourse' },
    semester : { type: Number, default: 0},

    enquiryDate: { type: Date, default: Date.now },

    managementPersonId: { type:mongoose.Schema.Types.ObjectId, default: null, ref:'employee'},
    isAdmissionConfirmed: { type: Boolean, default: false},
    isFeeCalculated: { type: Boolean, default: false},
    comments:{ type:String,default: ''},

    technologies : [{
        course:{type: mongoose.Schema.Types.ObjectId, default : null, ref: 'course'},
        enquiryTakenBy: [{ type:mongoose.Schema.Types.ObjectId, default:null, ref:'employee'}],
        duration:{ type:String, default:''},
        installments:{ type:Number, default:1},
        fee:{ type:Number, default:0},
        minimumRegistrationFee:{ type:Number, default:0},
        discount:{type:Number, default:0}
    }],

    totalFees : { type:Number, default:0},

    isDelete: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    updatedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    sessionYearId: {type:mongoose.Schema.Types.ObjectId, default:null, ref:'sessionYear'},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true },
    company: { type: String, default:null},
    dropById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    dropAt:{ type:Date,default:null },
    dropReason:{ type:String,default:null},
    isDrop:{type:Boolean,default:false}
})

module.exports = mongoose.model('enquiry', enquirySchema)
