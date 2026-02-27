const { register } = require('./register');
const { login } = require('./login');
const { getProfile } = require('./getProfile');
const { sendOtp } = require('./sendOtp');
const { verifyOtp } = require('./verifyOtp');
const { requestEmailChange } = require('./requestEmailChange');
const { verifyOldEmail } = require('./verifyOldEmail');
const { confirmNewEmail } = require('./confirmNewEmail');

module.exports = {
  register,
  login,
  getProfile,
  sendOtp,
  verifyOtp,
  requestEmailChange,
  verifyOldEmail,
  confirmNewEmail
};
