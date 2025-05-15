const mongoose = require('mongoose')

var clientSchema = mongoose.Schema({
    clientAutoId: { type: Number, default: 0 },
    
    name: { type: String, default: '' },
    administrator: { type:String, default:'' },
    phone: { type:String, default:'' },
    email: { type:String, default:'' },
    dob: { type:String, default:'' },
    address: { type:String, default:'' },
    location: { type:String, default:'' },
    gstNo: { type:String, default:'' },
    companyName: { type:String, default:'' },

    isDelete: { type: Boolean, default: false }, 
    isBlocked: { type: Boolean, default: false },

    addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    updatedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    sessionYearId: {type:mongoose.Schema.Types.ObjectId, default:null, ref:'sessionYear'},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true }
})

module.exports = mongoose.model('client', clientSchema)
