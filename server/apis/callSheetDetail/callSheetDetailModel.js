const mongoose = require('mongoose')

var callSheetDetailSchema = mongoose.Schema({
    callSheetDetailAutoId: { type: Number, default: 0 },
    
    callSheetId: { type: mongoose.Schema.Types.ObjectId, default:null, ref: 'callSheet' },

    srNo:{type:Number, default:0},
    rollNo: { type:Number, default:'' },
    studentName: { type:String, default:'' },
    contactNo:{type:String,default:''},
    
    callCount:{type:Number, default:0},
    callStatus: { type:String, default:'' },
    callerName: { type:String, default:'' },
    callDate: { type:Date, default:null },

    callHistory:[{
        callStatus: { type:String, default:'' },
        callerName: { type:String, default:'' },
        callDate: { type:Date, default:null }
    }],

    isDelete: { type: Boolean, default: false }, 
    isBlocked: { type: Boolean, default: false },

    addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    updatedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    sessionYearId: {type:mongoose.Schema.Types.ObjectId, default:null, ref:'sessionYear'},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true }
})

module.exports = mongoose.model('callSheetDetail', callSheetDetailSchema)
