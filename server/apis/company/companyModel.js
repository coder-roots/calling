const mongoose = require('mongoose')

var companySchema = mongoose.Schema({
    companyAutoId: { type: Number, default: 0 },
    name: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true }
})

module.exports = mongoose.model('company', companySchema)
