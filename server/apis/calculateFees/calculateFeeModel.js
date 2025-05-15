const mongoose = require('mongoose')

var calculateFeeSchema = mongoose.Schema({
    calculateFeeAutoId: { type: Number, default: 0 },

    isEnquiryFee: { type:Boolean, default:true},
    enquiryId : { type:mongoose.Schema.Types.ObjectId, default:null, ref:'enquiry' },
    admissionId :{type:mongoose.Schema.Types.ObjectId, default:null, ref:'admission'},
    batchId:{type:mongoose.Schema.Types.ObjectId, default:null, ref:'batch'},
    // if isEnquiryFee false

    totalFeesApplicable: { type:Number , default: 0},
    discount: { type:Number , default: 0},
    totalFeeToBePaid : { type : Number, default: 0},
    totalFeePaid:{type:Number, default:0 },
    totalBalance : { type:Number, default:0},
    isTotalFeePaid : { type:Boolean, default : false },
    extra:{ type:Number, default:0},

    registrationFeePayable : { type : Number, default : 0},
    registrationFeePaid : { type : Number, default : 0},
    registrationFeePending : { type : Number, default : 0},
    isRegistrationFeePending : { type:Boolean, default:true},
    pendingRegistraionPaidAt : { type:Date, default:null},
    isPendingRegistrationPaid : { type:Boolean, default:false},

    courseStartDate : { type:Date, default : Date.now },

    totalInstallments : { type: Number, default : 0},
    nextInstallment : { type:Number, default:null},

    installments : [{
        installmentNo: { type:Number, default:''},
        isAddedFromRegistration :{type:Boolean, default:false},
        amountAddedFromRegistration:{type:Number, default:0 },
        amountToBePaid : { type:Number, default:0},
        paidAmount : { type: Number, default: 0},
        createdAt: { type:Date, default:Date.now},
        collectedBy : { type:mongoose.Schema.Types.ObjectId, default: null, ref:'employee'},
        paidAt:{ type:Date, default:null},
        isBalancePending: { type:Boolean, default:null },
        balance: {type:Number, default:null },
        balancePayments : [{
            amountToBePaid:{type:Number, default:null},
            paidAmount:{type:Number, default:null},
            paidAt:{type:Date, default:null},
            collectedBy:{type:mongoose.Schema.Types.ObjectId, default:null, ref:'employee'}
        }],
        installmentMonth :{ type:Number,default:null}
    }],


    // isDirectCollected:{type:Boolean, default:false},
    // directCollection:[{
    //     paidAmount:{type:Number, default:0},
    //     paidAt:{type:Date, default:null},
    //     collectedBy:{type: mongoose.Schema.Types.ObjectId,default:null, ref:'employee'},
    //     createdAt:{type:Date, default:null}
    // }],

    isDelete: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    updatedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    sessionYearId: {type:mongoose.Schema.Types.ObjectId, default:null, ref:'sessionYear'},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true }
})

module.exports = mongoose.model('calculateFee', calculateFeeSchema)

