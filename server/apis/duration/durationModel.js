const mongoose = require('mongoose')

var durationSchema = mongoose.Schema({
    durationAutoId: { type: Number, default: 0 },
    
    duration: { type: String, default: '' },
    installments: { type:Number, default:'' },

    isDelete: { type: Boolean, default: false }, 
    isBlocked: { type: Boolean, default: false },

    addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    updatedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true }
})

module.exports = mongoose.model('duration', durationSchema)
