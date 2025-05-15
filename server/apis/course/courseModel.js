const mongoose = require('mongoose')

var courseSchema = mongoose.Schema({
    courseAutoId: { type: Number, default: 0 },
    name: { type: String, default: '' },
    duration : { type:mongoose.Schema.Types.ObjectId, default:null, ref:'duration' },
    fee:{type: Number, default : 0},
    minimumRegistrationFee:{type: Number, default : 0},
    detail :{type:String, default:''},
    image: { type: String, default: 'course/noImg.png' },
    trimImage: { type: String, default: '' },
    courseType: { type:Number, default: 0}, // 1 = combo, 2 = single


    isDelete: { type: Boolean, default: false }, 
    isBlocked: { type: Boolean, default: false },

    addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    updatedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    status: { type: Boolean, default: true }
})

module.exports = mongoose.model('course', courseSchema)
  