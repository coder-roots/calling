const multer = require('multer')
const path = require('path')
const fs = require('fs')

let imageStorageFun = multer.diskStorage({
    destination: function (req, file, cb) {
        let string = file.fieldname.split("_");
        let dir = "server/public/" + string[0]
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        let string = file.fieldname.split("_")
        req.body[string[1]] = Date.now() + path.extname(file.originalname)
        cb(null, Date.now() + req.body[string[1]]) //Appending extension
    }
})

function unlinkImage(pic) {
    if (!!pic && !!pic.path) {
        fs.unlink(pic.path, (err) => { });
    }
}

let uploadImageFun = multer({
    storage: imageStorageFun
});

module.exports = {
    uploadImageFun,
    unlinkImage
}