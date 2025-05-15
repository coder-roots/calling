const CalculateFee = require('../apis/calculateFees/calculateFeeModel')
const FeeReceipt = require('../apis/feeReceipt/feeReceiptModel')
const Admission = require('../apis/admission/admissionModel')
const Enquiry = require('../apis/enquiry/enquiryModel')
const Student = require('../apis/student/studentModel')
const Call = require('../apis/call/callModel')
const CollegeCourse = require('../apis/collegeCourse/collegeCourseModel')
const Client = require('../apis/client/clientModel')
const SessionYear = require('../apis/sessionYear/sessionYearModel')

const addKeyInCalculateFee = () => {
    CalculateFee.find().exec()
        .then((data) => {
            for (let x of data) {
                x.extra = 0
                x.save().then(() => {
                    console.log("Changed");
                })
            }
        })
}

const addKeyInFeeReceipt = () => {
    FeeReceipt.find().exec()
        .then((data) => {
            for (let x of data) {
                x.remarks = ''
                x.save().then(() => {
                    console.log("Changed");
                })
            }
        })
}

const addKeyInAdmission = () => {
    Admission.find().exec()
        .then((data) => {
            for (let x of data) {
                x.isCertificateProvided = false
                x.save().then(() => {
                    console.log("Changed");
                })
            }
        })
}

const addKeyInEnquiry = () => {
    Enquiry.find().exec()
        .then((data) => {
            for (let x of data) {
                if (!x.isAdmissionConfirmed) {
                    x.isAdmissionConfirmed = false
                    x.save().then(() => {
                        console.log("Changed");
                    })
                }

            }
        })
}


const addsessionYearKey = () => {
    Student.find().exec()
        .then((data) => {
            for (let x of data) {
                x.sessionYearId = '656eda171d4eaf93c320df2a'
                x.save().then(() => {
                    console.log("Changed");
                })
            }
        })
}

const addbatchIdInCalculateFee = () => {
    Admission.find({ "batches.batchId": '657bebd6aac69c89548011ce' }).exec()
        .then(async (data) => {
            for (let x of data) {
                let feeData = await CalculateFee.findOne({ admissionId: x._id })
                for (let y of x.batches) {

                    if (y.isCurrentAttendingBatch) {

                        feeData.batchId = y.batchId
                        feeData.save().then(() => {
                            console.log("Changed");
                        })
                    }
                    // else{
                    //     feeData.batchId = null
                    //     feeData.save().then(()=>{
                    //         console.log("Changed");
                    //     })
                    // }

                }

            }
        })
}


const addDiscountKeyInEnquiryAdmission = () => {
    Admission.find()
        .then(data => {
            for (let x of data) {
                for (let i of x.technologies) {
                    i.discount = 0
                }
                x.save().then(() => {
                    console.log("changed");
                })
            }
        })
}


const deleteCalculateFeeOfDeletedAdmissions = () => {
    Admission.find({
        isDelete: true
        , sessionYearId: '657d364d0b767bdfdd9fa1a1'
    }).then((data) => {
        for (let i in data) {
            let obj = data[i]
            CalculateFee.findOne({ admissionId: obj._id })
                .then(async (admissionData) => {
                    if (!!admissionData) {
                        if (admissionData.isDelete == false) {
                            admissionData.isDelete = true
                            console.log("Available", i);
                            admissionData.save()
                                .then(() => {
                                    if (i == data.length - 1) {
                                        console.log("done");
                                    }
                                })
                        }
                        else {
                            console.log("Not Available", i, "   ", obj._id);
                        }
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        }
        ;
    })
        .catch(err => {
            console.log(err);
        })

}


const addCollegeCourseInEnquiry = () => {
    Enquiry.find({$or:[{ collegeCourse: { $regex: "btech", $options: 'i' } },{ collegeCourse: { $regex: "b tech", $options: 'i' } }]}).then((enqData) => {
        if (enqData.length == 0) {
            console.log("No enq found");
        }
        else {

            CollegeCourse.findOne({ name: "B Tech CSE" }).then(async (ccdata) => {
                if (ccdata == null) {
                    console.log("College course not found")
                }
                else {
                    let a = 0
                    for (let x of enqData) {
                        console.log(x.collegeCourse);
                        a++
                        x.collegeCourseId = ccdata._id
                        await x.save().then(()=>{
                            console.log(a);

                        })
                    }

                }

            })
        }


    })
}

const addingPendingRegistrationKeys =()=>{
    CalculateFee.find({isDelete:false}).then(async (feeData)=>{
        if(feeData.length>0){
            let i = 0
            for(let x of feeData){

                if(x.isRegistrationFeePending ){
                    x.isPendingRegistrationPaid = false
                }
                else{

                    x.isPendingRegistrationPaid = true
                }
                if(x.installments.length>0 && x.installments[0]['isAddedFromRegistration'] == undefined){
                    x.installments[0]['isAddedFromRegistration'] = false
                    x.installments[0]['amountAddedFromRegistration'] = 0
                }

                i++;
                await x.save().then(()=>{

                    console.log("fee changed", i, x.calculateFeeAutoId)
                })
            }
        }
    })
}

module.exports = {
    addKeyInCalculateFee,
    addKeyInFeeReceipt,
    addKeyInAdmission,
    addKeyInEnquiry,
    addsessionYearKey,
    addbatchIdInCalculateFee,
    addDiscountKeyInEnquiryAdmission,
    deleteCalculateFeeOfDeletedAdmissions,
    addCollegeCourseInEnquiry,
    // addingPendingRegistrationKeys
}
