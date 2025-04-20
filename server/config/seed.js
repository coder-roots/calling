const User = require('../apis/user/userModel')
const bcrypt = require('bcrypt');
let salt = bcrypt.genSaltSync(10);

const userObj = {
    userAutoId: 1,
    name: "Admin",
    email: "admin@admin.com",
    password: bcrypt.hashSync("admin", salt),
    isDelete: false,
    isBlocked: false,
    userType: 1,
    phone: 9915710720

}
exports.createAdmin = async () => {
    let existingAdmin = await User.findOne({ email: userObj.email })
    if (!existingAdmin) {
        await new User(userObj).save().then(r => {
            logger.info("Admin created for the project")
        })
    }
    else {
        logger.info("Admin already exist.")
    }
}
