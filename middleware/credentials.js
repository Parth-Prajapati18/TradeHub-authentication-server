const allowedOringins = require('../config/allowedOrigins');

const credentials = (req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOringins.includes(origin)) {
        res.header('Access-Control-Allow-Crendetials', true);
    }
    next();
}

module.exports = credentials