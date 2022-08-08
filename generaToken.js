const crypto = require('crypto'); 

const generaToken = () => crypto.randomBytes(8).toString('hex');

module.exports = generaToken;