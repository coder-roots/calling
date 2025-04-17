const express = require('express')
const compression = require('compression')
const mongoose = require('./config/db');
const app = express()
const path = require('path')
const errorHandler = require('./middleware/responseHandler')
require('dotenv').config()
const port = process.env.PORT || 6001;
const address = process.env.SITE_URL || "127.0.0.1";

/** Routes imports */
const adminRoutes = require('./routes/adminRoutes')
/**Routes imports end */

/** logger */
const winston = require('winston')
let alignColorsAndTime = winston.format.combine(
    winston.format.colorize({
        all: true
    }),
    winston.format.label({
        label: '[GENEARL PROJECT LOGGER]'
    }),
    winston.format.timestamp({
        format: "YY-MM-DD HH:MM:SS"
    }),
    winston.format.printf(
        info => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
    )
);
const logConfiguration = {
    'transports': [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), alignColorsAndTime, winston.format.splat())
        }),
    ],
    // 'transports': [
    //     new winston.transports.File({
    //         filename: 'logs/example.log'
    //     })]
}
global.logger = winston.createLogger(logConfiguration)
/** logger */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false, parameterLimit: 500000000 }));
//for compression of response and faster
app.use(compression())
//routes
app.use('/admin', adminRoutes)

app.get('/', (req, res) => {
    res.send('Welcome to the Server ');
});

require('./config/seed').createAdmin()
//global error handler
app.use(errorHandler)

app.listen(port, address, () => {
    logger.info(`Server listening on port ${port}!`);
});
