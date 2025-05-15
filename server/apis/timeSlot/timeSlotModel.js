const mongoose = require('mongoose')

var timeSlotSchema = mongoose.Schema({
    timeSlotAutoId: { type: Number, default: 0 },
    slot: { type: String, default: '' },
    // duration : { type: Number, default : 0},

    isDelete: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    updatedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true }
}) 

module.exports = mongoose.model('timeSlot', timeSlotSchema)
