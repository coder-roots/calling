const mongoose = require('mongoose')

var callSheetSchema = mongoose.Schema({
    callSheetAutoId: { type: Number, default: 0 },
    collegeId: { type: mongoose.Schema.Types.ObjectId, default: null, ref:'college' },
    course: { type:String, default:'' },
    semester : { type: Number, default: 0}, 
    comments:{ type:String, default:''},
    attachment:{type:String, default: '' },
    sheetDate:{type:Date, default:Date.now},
    isDelete: { type: Boolean, default: false }, 
    isBlocked: { type: Boolean, default: false },
    addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    updatedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    sessionYearId: {type:mongoose.Schema.Types.ObjectId, default:null, ref:'sessionYear'},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true },
    company:{ type:String, default:''},
})

module.exports = mongoose.model('callSheet', callSheetSchema)
