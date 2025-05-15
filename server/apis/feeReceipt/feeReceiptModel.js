const mongoose = require('mongoose')

var feeReceiptSchema = mongoose.Schema({
    feeReceiptAutoId: { type: Number, default: 0 },

    isRegistrationSlip: { type: Boolean, default: false },

    calculateFeeId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'calculateFee' },
    admissionId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'admission' },
    amountPaid: { type: Number, default: '' },
    installmentNumber: { type: Number, default: 0 },
    paymentMethod: { type: String, default: '' },
    collectedOn: { type: Date, default: Date.now },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'employee' },
    remarks: { type: String, default: '' },

    // batches :[{type:mongoose.Schema.Types.ObjectId, default:null, ref:'batch'}],


    // comments:{type:String, default:''},
    isDelete: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    updatedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    sessionYearId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'sessionYear' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true },
    receiptType: { type: Number, default: 0 }, // 0 : computerized , 1 : manual
    manualReceiptNumber: { type: String, default: null },
    receiptHead: [{ type: String, default: null }],
    courseTaken: { type: String, default: null },
    company: { type: String, default: null },
    // fine
    totalFine: { type: Number, default: 0 },
    finePaid: { type: Number, default: 0 },
    reason: { type: String, default: '' },



})

module.exports = mongoose.model('feeReceipt', feeReceiptSchema)
