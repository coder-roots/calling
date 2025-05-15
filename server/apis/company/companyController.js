const Company = require('./companyModel')

module.exports = {
    index,

}
async function index(req, res, next) {
    await indexFun(req, next).then(next).catch(next);
};
function indexFun(req, next) {
    return new Promise((resolve, reject) => {

      resolve({
        status: 200,
        success: true,
        total: 3,
        message: "All Companies Loaded",
        data: ['Jain Student Provider','VSS Immi','Manu Sharma']
      });

        // Company.find(find)
        //     .exec()
        //     .then(async alldocuments => {
        //         var total = 0
        //         total = await Course.countDocuments(find)
        //         resolve({
        //             status: 200,
        //             success: true,
        //             total: total,
        //             message: "All Courses Loaded",
        //             data: ['O7 SERVICES', 'O7 SOLUTIONS', 'CODER ROOTS'];
        //         });
        //     })
        //     .catch(next)
    });
}
// addCourseFuu();


// async function addCourseFuu() {
//   let formData = {};
//   formData.name= "O7 Services"
//       await Company.findOne({ $and: [{ name: formData.name }, { isDelete: false }] }).then(data => {
//           if (!data) {
//               Company.countDocuments()
//                   .then(total => {
//                       var course = Company()
//                       course.companyAutoId = total + 1
//                       course.name = formData.name
//                       course.save()
//                           .then(saveRes => {
//                             console.log(saveRes);
//                           }).catch(err => {
//                             console.log(err)
//                           })
//                   })
//           }})
// }


