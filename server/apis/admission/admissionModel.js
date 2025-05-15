const mongoose = require('mongoose')

var admissionSchema = mongoose.Schema({
  admissionAutoId: { type: Number, default: 0 },

  isDirectAdmission: { type: Boolean, default: false },
  enquiryId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'enquiry' }, // if direct admission false
  isNewStudent: { type: Boolean, default: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'student'},
  isOfficialTraining: { type: Boolean, default: false },
  trainingType: { type: String, default: '' },   // if official Training true : '6 months', '6 weeks'
  isPassout: { type: Boolean, default: false },
  college: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'college' },
  collegeCourse: { type: String, default: '' },
  semester: { type: Number, default: 0 },
  managementPersonId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'employee' },
  isFeeCalculated: { type: Boolean, default: false },
  technologies: [{
    course: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'course' },
    enquiryTakenBy: [{ type: mongoose.Schema.Types.ObjectId, default: null, ref: 'employee' }],
    duration: { type: String, default: '' },
    installments: { type: Number, default: 1 },
    fee: { type: Number, default: 0 },
    minimumRegistrationFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 }
  }],
  batches: [{
    isCurrentAttendingBatch: { type: Boolean, default: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'batch' }
  }],

  changeCourseLogs: [{
    prevTechnologies: [{
      course: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'course' },
      duration: { type: String, default: '' },
      installments: { type: Number, default: 1 },
      fee: { type: Number, default: '' },
      minimumRegistrationFee: { type: Number, default: '' }
    }],
    prevFeeStructure: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'prevCalculateFee' },
    createdAt: { type: Date, default: null }
  }],

  comments: { type: String, default: '' },
  admissionDate: { type: Date, default: Date.now },

  isActive: { type: Boolean, default: true, },
  isTotalFeePaid: { type: Boolean, default: false },

  isCertificateProvided: { type: Boolean, default: false },

  isDelete: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },

  addedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
  updatedById: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
  sessionYearId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'sessionYear' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
  status: { type: Boolean, default: true },
  dropReason: { type: String, default: null },
  dropDate: { type: Date, default: null }, // null means no drop and drop mean drop date
  company: { type: String, default: null }
})

module.exports = mongoose.model('admission', admissionSchema)
