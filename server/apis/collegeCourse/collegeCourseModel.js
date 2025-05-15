const mongoose = require('mongoose')

var collegeCourseSchema = mongoose.Schema({
    collegeCourseAutoId: { type: Number, default: 0 },
    
    name: { type: String, default: '' },

    isDelete: { type: Boolean, default: false }, 
    isBlocked: { type: Boolean, default: false },

    addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    updatedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true }
})

module.exports = mongoose.model('collegeCourse', collegeCourseSchema)
