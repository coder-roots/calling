const mongoose = require('mongoose')

var storeItemSchema = mongoose.Schema({
    storeItemAutoId: { type: Number, default: 0 },
    
    itemType: { type: String, default: '' },
    name: { type:String, default:'' },
    quantity: { type:Number, default:1 },
    inUse:{ type:Number, default:0 },
    comments: { type: String, default:''},

    issueDate : { type:Date, default:null }, 
    submitDate : { type:Date, default:null }, 

    assignedTo : { type:mongoose.Schema.Types.ObjectId, default:null, ref:'employee'},
    labId : { type:mongoose.Schema.Types.ObjectId, default:null, ref:'lab'},

    isDelete: { type: Boolean, default: false }, 
    isBlocked: { type: Boolean, default: false }, 

    addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    updatedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true }
})

module.exports = mongoose.model('storeItem', storeItemSchema)
