const sharp = require('sharp');

const router = require('express').Router()
const userController = require('../apis/user/userController')
const categoryController = require('../apis/category/categoryController')

//helper
var helper = require('../utilities/helper')




/** AUTHENTICATION */
router.post('/login', userController.login)

/** AUTHENTICATION */
router.use(require('../middleware/admintokerchecker'))

/** User Routes */

router.post('/user/all', userController.index)
router.post('/user/single', userController.fetchUserById)
router.post('/user/add', userController.addUser)
router.post('/user/update', userController.updateUser)
router.delete('/user/delete', userController.deleteUser)

/** User Routes  Ends*/

/** User Routes */
async function trim(req){
    if(req!=null && req.file!=null && req.file.path!=null){
        await sharp(req.file.path)
        .resize(100)
        .jpeg({ quality: 80 })
        .toFile(
        req.file.destination+"/trim_"+req.body.image 
        , (err, info) => {          
            if(info!=null&& info!=undefined)
                req.body.trimImage = "trim_"+req.body.image 
        });
    }
}
router.post('/category/all', categoryController.index)
router.post('/category/single', categoryController.fetchCategoryById)
router.post('/category/add', helper.uploadImageFun.single('category_image'),async (req,res,next)=>{ await trim(req);next();},categoryController.addCategory)
router.post('/category/update', helper.uploadImageFun.single('category_image'), categoryController.updateCategory)
router.delete('/category/delete', categoryController.deleteCategory)

/** User Routes  Ends*/



router.post('*', (req, res) => {
    res.status(404).send({
        success: false,
        status: 404,
        message: "Invalid address"
    })
})










module.exports = router