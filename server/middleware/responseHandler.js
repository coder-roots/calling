module.exports = responseHandler

function responseHandler(response, req, res, next) {
    switch (true) {
        case typeof response === 'string':
            // custom application error
            logger.error(response)
            const is404 = response.toLowerCase().endsWith('not found');
            let statusCode = is404 ? 404 : 400;
            if (response.toLowerCase().includes('unauthorized'))
                statusCode = 403
            return res.status(200).json({ status: statusCode, success: false, message: response });
        case response.success === true:
            return res.status(200).json(response);
        case response.success === false:
            return res.status(200).json({ status: response.status, success: false, message: response.message });
        default:
            return res.status(200).json({ status: 500, success: false, message: response.message });
    }
}