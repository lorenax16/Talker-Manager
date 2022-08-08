const crypto = require('crypto'); 

const token1 = () => crypto.randomBytes(8).toString('hex');

module.exports = { token1 };