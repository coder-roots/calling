const mongoose = require('mongoose')

var sessionYearSchema = mongoose.Schema({
    sessionYearAutoId: { type: Number, default: 0 },
    
    name: { type: String, default: '' },
    isActive: { type: Boolean, default: false },
    
    isDelete: { type: Boolean, default: false }, 
    

    addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    updatedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true }
})

module.exports = mongoose.model('sessionYear', sessionYearSchema)
