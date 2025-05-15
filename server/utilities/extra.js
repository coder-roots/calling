const Enquiry = require('../apis/enquiry/enquiryModel')
const Student = require('../apis/student/studentModel')
const Call = require('../apis/call/callModel')
const CollegeCourse = require('../apis/collegeCourse/collegeCourseModel')
const Client = require('../apis/client/clientModel')
const SessionYear = require('../apis/sessionYear/sessionYearModel')

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

module.exports = {
    // addingPendingRegistrationKeys
}
