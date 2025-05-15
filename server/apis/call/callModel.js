const mongoose = require('mongoose')

var callSchema = mongoose.Schema({
    callAutoId: { type: Number, default: 0 },
    isEnquiryCall:{type:Boolean, default:true},
    enquiryId: { type: mongoose.Schema.Types.ObjectId, default:null, ref: 'enquiry' },
    admissionId:{type:mongoose.Schema.Types.ObjectId, default:null, ref:'admission'},

    callerName: { type:String, default:'' },
    callDate: { type:Date, default:Date.now},
    callStatus: { type:String, default:'' },

    isDelete: { type: Boolean, default: false }, 
    isBlocked: { type: Boolean, default: false },

    addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    updatedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    sessionYearId: {type:mongoose.Schema.Types.ObjectId, default:null, ref:'sessionYear'},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true }
})

module.exports = mongoose.model('call', callSchema)
