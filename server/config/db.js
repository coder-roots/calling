const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


const dbPath = "mongodb+srv://office:softwareoffice@officesoft.mjwwrmt.mongodb.net/o7-fee"
// const dbPath = 'mongodb://localhost:27017/o7-fee'
const options = { useNewUrlParser: true, useUnifiedTopology: true }
const mongo = mongoose.connect(dbPath, options); mongo.then(() => {
    logger.info('DB Connected');
}, error => {

    logger.info(error, 'error');
});

exports.isValid = function (id) {
    return mongoose.Types.ObjectId.isValid(id)
}


//softwareoffice