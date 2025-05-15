const mongoose = require('mongoose')


var fineSchema = mongoose.Schema({
    fineAutoId: { type: Number, default: 0 },
    receiptId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'feeReceipt' },
    studentId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'student' },
    admissionId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'admission' },
    totalFineApplicable: { type: Number, default: 0 },
    totalFinePayable: { type: Number, default: 0 },
    installmentNumber: { type: String, default: '' },
    reason: { type: String, default: '' },
    isDelete: { type: Boolean, default: false },
    addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true },
})

module.exports = mongoose.model('fine', fineSchema)
