const sharp = require('sharp');

const router = require('express').Router()
const userController = require('../apis/user/userController')
const roleAndPermissionController = require('../apis/roleAndPermission/roleAndPermissionController')
const courseController = require('../apis/course/courseController')
const employeeController = require('../apis/employee/employeeController')
const labController = require ('../apis/lab/labController.js')
const feeReceiptController = require ('../apis/feeReceipt/feeReceiptController.js')
const durationController = require ('../apis/duration/durationController.js')
const collegeController = require ('../apis/college/collegeController.js')
const collegeCourseController = require ('../apis/collegeCourse/collegeCourseController.js')
const timeSlotController = require ('../apis/timeSlot/timeSlotController.js')
const enquiryController = require ('../apis/enquiry/enquiryController.js')
const callController = require ('../apis/call/callController.js')
const callSheetController = require ('../apis/callSheet/callSheetController.js')
const callSheetDetailController = require ('../apis/callSheetDetail/callSheetDetailController.js')
const studentController = require ('../apis/student/studentController.js')
const admissionController = require ('../apis/admission/admissionController.js')
const calculateFeeController = require ('../apis/calculateFees/calculateFeeController')
const storeItemController = require ('../apis/storeItem/storeItemController')
const clientController = require ('../apis/client/clientController')
const dashboardController = require ('../apis/dashboard/dashboardController')
const sessionYearController = require ('../apis/sessionYear/sessionYearController')
const reportController = require ('../apis/report/reportController.js')
const companyController = require ('../apis/company/companyController');
//helper
var helper = require('../utilities/helper')

/** AUTHENTICATION */
router.post('/login', userController.login)

// session Year
router.post('/sessionYear/all', sessionYearController.index)


/** AUTHENTICATION */
router.use(require('../middleware/admintokerchecker'))

router.get('/dashboard', dashboardController.dashboard)
router.get('/list', dashboardController.list)


async function trim(req, res, next){
    if(req!=null && req.file!=null && req.file.path!=null){
        // console.log(1);
        await sharp(req.file.path)
        .resize(100)
        .jpeg({ quality: 80 })
        .toFile(
        req.file.destination+"/trim_"+req.body.image
        , (err, info) => {
            // console.log("full",req.file.destination+"/trim_"+req.body.image )
            // console.log(info);
            if(info!=null&& info!=undefined){
                  req.body.trimImage = "trim_"+req.body.image
                //   console.log(req.body.trimImage);
                  next();
            }


        });
    }
    else
        next()
}


/** Role and Permission Routes */

router.post('/role/all', roleAndPermissionController.index)
router.post('/role/single', roleAndPermissionController.fetchRoleById)
router.post('/role/add', roleAndPermissionController.addRole)
router.post('/role/update', roleAndPermissionController.updateRole)
router.post('/role/delete', roleAndPermissionController.deleteRole)

/** Role and Permission Routes  Ends*/

/** User Routes */

router.post('/user/all', userController.index)
router.post('/user/single', userController.fetchUserById)
router.post('/user/add', userController.addUser)
router.post('/user/update', userController.updateUser)
router.post('/user/delete', userController.deleteUser)
router.post('/user/changePassword', userController.changePassword)
router.post('/user/enableDisable', userController.enableDisableUser)
router.post('/user/enableDisable', userController.enableDisableUser)

/** User Routes  Ends*/


/** SessionYear Routes*/

router.post('/sessionYear/single', sessionYearController.fetchSessionYearById)
router.post('/sessionYear/add', sessionYearController.addSessionYear)
router.post('/sessionYear/update', sessionYearController.updateSessionYear)
router.post('/sessionYear/updateStatus', sessionYearController.updateActiveStatus)
router.post('/sessionYear/delete', sessionYearController.deleteSessionYear)

/** SessionYear Routes  Ends*/

/** Duration Routes*/
router.post('/duration/all', durationController.index)
router.post('/duration/single', durationController.fetchDurationById)
router.post('/duration/add', durationController.addDuration)
router.post('/duration/update', durationController.updateDuration)
router.post('/duration/delete', durationController.deleteDuration)

/** Duration Routes  Ends*/

/** College Routes*/
router.post('/college/all', collegeController.index)
router.post('/college/single', collegeController.fetchCollegeById)
router.post('/college/add', collegeController.addCollege)
router.post('/college/update', collegeController.updateCollege)
router.post('/college/delete', collegeController.deleteCollege)

/** College Routes  Ends*/

/** CollegeCourse Routes*/
router.post('/collegeCourse/all', collegeCourseController.index)
router.post('/collegeCourse/single', collegeCourseController.fetchCollegeCourseById)
router.post('/collegeCourse/add', collegeCourseController.addCollegeCourse)
router.post('/collegeCourse/update', collegeCourseController.updateCollegeCourse)
router.post('/collegeCourse/delete', collegeCourseController.deleteCollegeCourse)

/** CollegeCourse Routes  Ends*/


/** Course Routes */

router.post('/course/all', courseController.index)
router.post('/course/single', courseController.fetchCourseById)
router.post('/course/add',helper.uploadImageFun.single('course_image'), async (req, res, next) => { await trim(req, res, next); }, courseController.addCourse)
router.post('/course/update',helper.uploadImageFun.single('course_image'), async (req, res, next) => { await trim(req, res, next);}, courseController.updateCourse)
router.post('/course/delete', courseController.deleteCourse)

/** Course Routes Ends*/

/** Lab Routes*/
router.post('/lab/all', labController.index)
router.post('/lab/single', labController.fetchLabById)
router.post('/lab/add', async (req, res, next) => { await trim(req, res, next);  }, labController.addLab)
router.post('/lab/update', labController.updateLab)
router.post('/lab/delete', labController.deleteLab)


/** Fee Receipt Routes*/
router.post('/feeReceipt/all', feeReceiptController.index)
router.post('/feeReceipt/single', feeReceiptController.fetchFeeReceiptById)
router.post('/feeReceipt/add', feeReceiptController.addFeeReceipt)
router.post('/feeReceipt/direct/add', feeReceiptController.addFeeReceiptOfDirectCollection)
router.post('/feeReceipt/update', feeReceiptController.updateFeeReceipt)
router.post('/feeReceipt/delete', feeReceiptController.deleteFeeReceipt)

/** Lab Routes  Ends*/

/** time slot Routes*/
router.post('/timeSlot/all', timeSlotController.index)
router.post('/timeSlot/single', timeSlotController.fetchTimeSlotById)
router.post('/timeSlot/add',  timeSlotController.addTimeSlot)
router.post('/timeSlot/update', timeSlotController.updateTimeSlot)
router.post('/timeSlot/delete', timeSlotController.deleteTimeSlot)

/** time slot Routes  Ends*/


/** batch Routes  Ends*/

/** Employee Routes */

router.post('/employee/all', employeeController.index)
router.post('/employee/single', employeeController.fetchEmployeeById)
router.post('/employee/add', helper.uploadImageFun.single('employee_image'),async (req,res,next)=>{ await trim(req, res, next);},employeeController.addEmployee)
router.post('/employee/add/multiple',employeeController.addEmployeeMultiple)
router.post('/employee/update', helper.uploadImageFun.single('employee_image'),async (req,res,next)=>{ await trim(req, res, next);}, employeeController.updateEmployee)
router.post('/employee/delete', employeeController.deleteEmployee)
router.post('/employee/changeStatus', employeeController.changeStatusEmployee)

/** Client Routes*/

router.post('/client/all', clientController.index)
router.post('/client/single', clientController.fetchClientById)
router.post('/client/add',clientController.addClient)
router.post('/client/update', clientController.updateClient)
router.post('/client/delete', clientController.deleteClient)

/** Client Routes  Ends*/


/** Enquiry Routes */

router.post('/enquiry/all', enquiryController.index)
router.post('/enquiry/single', enquiryController.fetchEnquiryById)
router.post('/enquiry/add', enquiryController.addEnquiry)
router.post('/enquiry/add/multiple', enquiryController.addEnquiryMultiple)
router.post('/enquiry/update', enquiryController.updateEnquiry)
router.post('/enquiry/delete', enquiryController.deleteEnquiry)

router.post('/enquiry/drop',enquiryController.dropEnquiry);

/** Call Routes */

router.post('/call/all', callController.index)
router.post('/call/single', callController.fetchCallById)
router.post('/call/add', callController.addCall)
router.post('/call/update', callController.updateCall)
router.post('/call/delete', callController.deleteCall)

/** Call Routes Ends*/

/** CallSheet Routes */

router.post('/callSheet/all', callSheetController.index)
router.post('/callSheet/single', callSheetController.fetchCallSheetById)
router.post('/callSheet/add', callSheetController.addCallSheet)
router.post('/callSheet/update', callSheetController.updateCallSheet)
router.post('/callSheet/delete', callSheetController.deleteCallSheet)

router.post('/callSheetDetail/all', callSheetDetailController.index)
router.post('/callSheetDetail/add', callSheetDetailController.addCallSheetDetail)

/** CallSheet Routes Ends*/

/** Enquiry Routes*/

router.post('/calculateFee/all', calculateFeeController.index)
router.post('/calculateFee/add', calculateFeeController.calculateFee)
router.post('/calculateFee/enquiry/single', calculateFeeController.fetchCalculatedFeeByEnquiryId)
router.post('/calculateFee/admission/single', calculateFeeController.fetchCalculatedFeeByAdmissionId)
router.post('/calculateFee/update', calculateFeeController.recalculateFee)


/** Enquiry Routes Ends*/


/** Student Routes */

router.post('/student/all', studentController.index)
router.post('/student/single', studentController.fetchStudentById)
router.post('/student/add', studentController.addStudent)
router.post('/student/update', studentController.updateStudent)
router.post('/student/delete', studentController.deleteStudent)

/** Student Routes Ends*/

/** Admission Routes */

router.post('/admission/all', admissionController.index)
router.post('/admission/single', admissionController.fetchAdmissionById)
router.post('/admission/add', admissionController.addAdmission)
router.post('/admission/confirm', admissionController.confirmAdmission)
router.post('/admission/update', admissionController.updateAdmission)
router.post('/admission/details/update', admissionController.updateDetailAdmission)
router.post('/admission/delete', admissionController.deleteAdmission)
router.post('/admission/changeCourse', admissionController.changeCourse)

/** Admission Routes Ends*/


/** StoreItem Routes */

router.post('/storeItem/all', storeItemController.index)
router.post('/storeItem/single', storeItemController.fetchStoreItemById)
router.post('/storeItem/add', storeItemController.addStoreItem)
// router.post('/storeItem/confirm', storeItemController.confirmStoreItem)
router.post('/storeItem/update', storeItemController.updateStoreItem)
router.post('/storeItem/delete', storeItemController.deleteStoreItem)


// report routes start
router.post('/report/registrationDefaulter',reportController.registrationDefaulter)
router.post('/report/daybook',reportController.dayBook)
router.post('/report/daybookSummary',reportController.dayBookSummary);
router.post('/report/dropList',admissionController.dropAdmissionList);
router.post('/report/enquiry/list',enquiryController.dropEnquiryList);
router.post('/report/overallBalance',reportController.overallBalance);


router.post('/admission/dropAdmission',admissionController.dropAdmission)

router.post('/company/all',companyController.index);


//  report routes end

/** StoreItem Routes Ends*/

router.all('*', (req, res) => {
    res.status(404).send({
        success: false,
        status: 404,
        message: "Invalid address"
    })
})










module.exports = router
