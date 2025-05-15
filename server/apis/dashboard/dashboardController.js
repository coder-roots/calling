const Duration = require('../duration/durationModel')
const College = require('../college/collegeModel')
const CollegeCourse = require('../collegeCourse/collegeCourseModel')
const Course = require('../course/courseModel')
const Lab = require('../lab/labModel')
const TimeSlot = require('../timeSlot/timeSlotModel')
const Employee = require('../employee/employeeModel')
const Enquiry = require('../enquiry/enquiryModel')
const Admission = require('../admission/admissionModel')
const Session = require('../sessionYear/sessionYearModel')
const Call = require('../call/callModel')
const FeeReceipt = require('../feeReceipt/feeReceiptModel')
const userModel = require('../user/userModel')

async function dashboard(req, res, next) {
    await dashboardFun(req, next).then(next).catch(next);
};
function dashboardFun(req, next) {
    return new Promise(async (resolve, reject) => {

        let find = { isDelete: false }
        let start = new Date()
        start.setHours(0, 0, 0, 0)
        let end = new Date()
        end.setHours(23, 59, 59, 999)
        if (req.headers != undefined && req.headers.sessionyearid != undefined) {
            find.sessionYearId = req.headers.sessionyearid;
        }
        let userData = await userModel.findOne({_id:req.decoded._id});

        let createdAt = { $gt: start, $lt: end };

        if(userData?.assignedCompanies?.length>0) {
          find = {$and:[{company:{$in: userData?.assignedCompanies}},{createdAt:createdAt},{ isDelete: false }]}
        } else {
          find.createdAt = createdAt;
        }




        let enquiries = await Enquiry.find(find)
        let admissions = await Admission.find(find)
        let feeReceipt = await FeeReceipt.find(find)
        let batches = []
        let todayPaymentsReceived = 0
        let totalPaymentsReceived = 0
        let calls = await Call.find(find)
        if (feeReceipt.length > 0)
            for (let i of feeReceipt) {
                todayPaymentsReceived += i.amountPaid
            }

        resolve({
            success: true,
            status: 200,
            data: {
                enquiries: enquiries.length,
                admissions: admissions.length,
                calls: calls.length,
                batches: [],
                todayPaymentsReceived: todayPaymentsReceived,
                totalPaymentsReceived: totalPaymentsReceived
            }

        })
    });
}

async function list(req, res, next) {
    await listFun(req, next).then(next).catch(next);
};
function listFun(req, next) {
    return new Promise(async (resolve, reject) => {
        let find = { isDelete: false }
        let durations = await Duration.find(find)
        let colleges = await College.find(find)
        let collegeCourses = await CollegeCourse.find(find)
        let courses = await Course.find(find).populate('duration')
        let labs = await Lab.find(find)
        let timeSlots = await TimeSlot.find(find)
        let employees = await Employee.find(find)
        let sessions = await Session.find(find)

        resolve({
            success: true,
            status: 200,
            list: {
                durations: durations,
                colleges: colleges,
                courses: courses,
                collegeCourses: collegeCourses,
                labs: labs,
                timeSlots: timeSlots,
                employees: employees,
                sessions: sessions,
            }

        })
    });
}

module.exports = { dashboard, list }
