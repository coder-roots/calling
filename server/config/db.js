const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const dbPath = process.env.DBPATH || 'mongodb+srv://Gaurav123:o7empPass123@o7emp01.cabzh.mongodb.net/admin-management';

const options = { useNewUrlParser: true, useUnifiedTopology: true }
const mongo = mongoose.connect(dbPath, options); mongo.then(() => {
    logger.info('DB Connected');
}, error => {

    logger.info(error, 'error');
});

exports.isValid = function (id) {
    return mongoose.Types.ObjectId.isValid(id)
}