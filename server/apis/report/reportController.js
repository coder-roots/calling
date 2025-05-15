const calculateFeeModel = require('../calculateFees/calculateFeeModel');
const CalculateFee = require('../calculateFees/calculateFeeModel');
const feeReceiptModel = require('../feeReceipt/feeReceiptModel');
const SessionYear = require('../sessionYear/sessionYearModel')
const moment = require('moment');
const { ObjectId } = require('mongodb');
const mongoose = require("mongoose")


module.exports = {
  registrationDefaulter,
  dayBook,
  dayBookSummary,
  overallBalance

}

async function registrationDefaulter(req, res, next) {
  await registrationDefaulterFun(req, next).then(next).catch(next);
};

function registrationDefaulterFun(req, next) {
  return new Promise((resolve, reject) => {
    let formData = {};
    if (req.body != undefined) formData = req.body;

    let oneMonthBack = moment().subtract(1, 'months');
    let utctime = moment(oneMonthBack).startOf('day').toDate();
    let { sessionYearId, courseId, company } = formData;


    let query = {
      courseStartDate: { $lte: utctime },
      isRegistrationFeePending: true,
      sessionYearId: sessionYearId,
    };

    CalculateFee.find(query)
      .populate({
        path: "admissionId",
        match: {
          ...(company && { company }),
          ...(courseId && {
            "technologies.course": courseId,
          }),
        },
        populate: [
          { path: "technologies.course" },
          { path: "studentId" },
        ],
      })
      .exec()
      .then(alldocuments => {

        alldocuments = alldocuments.filter(doc => doc.admissionId !== null);

        resolve({
          status: 200,
          success: true,
          total: alldocuments.length,
          message: "All Registration Defaulters Loaded",
          data: alldocuments,
        });
      })
      .catch(next);
  });
}



async function dayBook(req, res, next) {
  await dayBookFun(req, next).then(next).catch(next);
};
function dayBookFun(req, next) {
  return new Promise((resolve, reject) => {
    if (req.body != undefined) formData = req.body;
    let startTime = moment(formData.date).startOf('day').toDate();
    let endTime = moment(formData.date).endOf('day').toDate();
    let { sessionYearId, company, courseId, collegeId } = formData;
    let query = {
      $and: [
        { collectedOn: { $gte: startTime } },
        { collectedOn: { $lte: endTime } },
        { isDelete: false },
        { sessionYearId: sessionYearId },
      ],
    };

    feeReceiptModel.find(query)
      .populate({
        path: "collectedBy",
        select: "name",
      })
      .populate({
        path: "admissionId",
        match: {
          ...(company && { company }),
          // ...(courseId && {
          //   "technologies.course": courseId,
          // }),
          ...(collegeId && {
            "college": collegeId,
          }),
        },
        populate: [
          {
            path: "studentId",
            select: "studentName personalContact",
          },
          {
            path: "technologies.course",
          },
        ],
      })
      .sort({ collectedOn: -1 })
      .exec()
      .then(async alldocuments => {
        alldocuments = alldocuments.filter(doc => doc.admissionId !== null);
        let total = alldocuments.length;
        resolve({
          status: 200,
          success: true,
          total: total,
          message: "Today Daybook Loaded",
          data: alldocuments,
        });
      })
      .catch(next);
  });
}



async function dayBookSummary(req, res) {
  var result = {};
  await dayBookSummaryFun(req)
    .then((data) => {
      result = data;
      res.status(result.status).json(result);
    })
    .catch((err) => {
      result.success = false;
      if (err.status != undefined) {
        result.status = err.status;
        result.message = err.message;
      } else {
        result.status = 500;
        result.message = "Server Error " + String(err);
      }
      res.status(result.status).json(result);
    });
};




function dayBookSummaryFun(req) {
  return new Promise((resolve, reject) => {
    let formData = req.body;
    let findy = [{ isDelete: false }];

    if (!!formData.startDate) {
      var start = new Date(formData.startDate);
      start.setHours(0, 0, 0, 0);
      delete formData.startDate;
      findy.push({ collectedOn: { $gte: new Date(start) } });
    }

    if (!!formData.endDate) {
      var end = new Date(formData.endDate);
      end.setHours(23, 59, 59, 999);
      delete formData.endDate;
      findy.push({ collectedOn: { $lte: new Date(end) } });
    }

    if (!!formData.sessionYearId) {
      findy.push({ sessionYearId: ObjectId(formData.sessionYearId) });
    }


    if (!!formData.company) {
      findy.push({ company: formData.company });
    }

    let find = { $and: findy };

    feeReceiptModel.aggregate([
      {
        $match: find
      },
      {
        $group: {
          _id: {
            company: '$company',
            year: { $year: '$collectedOn' },
            month: { $month: '$collectedOn' },
            date: { $dayOfMonth: '$collectedOn' }
          },
          registrationFee: {
            $sum: {
              $cond: {
                if: { $eq: ['$isRegistrationSlip', true] },
                then: '$amountPaid',
                else: 0
              }
            }
          },
          installmentFee: {
            $sum: {
              $cond: {
                if: { $ne: ['$isRegistrationSlip', true] },
                then: '$amountPaid',
                else: 0
              }
            }
          },
          cash: {
            $sum: {
              $cond: {
                if: { $eq: ['$paymentMethod', 'Cash'] },
                then: '$amountPaid',
                else: 0
              }
            }
          },
          online: {
            $sum: {
              $cond: {
                if: { $ne: ['$paymentMethod', 'Cash'] },
                then: '$amountPaid',
                else: 0
              }
            }
          },
          total: {
            $sum: '$amountPaid'
          }

        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.date': 1
        }
      }
    ]).then((alldocuments) => {
      resolve({
        status: 200,
        success: true,
        message: "Company-wise DayBook Summary Loaded",
        data: alldocuments
      });
    }).catch((err) => {
      if (err.kind == "ObjectId") {
        err = "Your Id Format is Wrong";
      }
      reject({
        status: 422,
        success: false,
        message: String(err),
      });
    });
  });
}





async function overallBalance(req, res, next) {
  await overallBalanceFun(req, next).then(next).catch(next);
};

function overallBalanceFun(req, next) {
  return new Promise((resolve, reject) => {
    let formData = req.body;
    let findy = [{ isEnquiryFee: false }, { isDelete: false }, { status: true }, { totalBalance: { $gt: 0 } }];

    if (!!formData.startDate) {
      var start = new Date(formData.startDate);
      start.setHours(0, 0, 0, 0);
      delete formData.startDate;
      findy.push({ courseStartDate: { $gte: new Date(start) } });
    }

    if (!!formData.endDate) {
      var end = new Date(formData.endDate);
      end.setHours(23, 59, 59, 999);
      delete formData.endDate;
      findy.push({ courseStartDate: { $lte: new Date(end) } })
    }

    if (!!formData.sessionYearId) {
      findy.push({ sessionYearId: ObjectId(formData.sessionYearId) });
    }

    let query = { $and: findy };

    calculateFeeModel.find(query)
      .populate({
        path: 'admissionId',
        match: {
          ...(formData.company && { company: formData.company }),
          ...(formData.courseId && { 'technologies.course': formData.courseId })
        },
        populate: [
          { path: 'technologies.course' },
          { path: 'studentId' },
        ]
      })
      .sort({ totalBalance: -1 })
      .exec()
      .then(async alldocuments => {
        alldocuments = alldocuments.filter(doc => doc.admissionId !== null);
        let total = alldocuments.length;
        resolve({
          status: 200,
          success: true,
          total: total,
          message: "Overall Balance Loaded",
          data: alldocuments,
        });
      })
      .catch(next);
  });
}



