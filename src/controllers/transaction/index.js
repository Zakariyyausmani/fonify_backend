const { createPaymentIntent } = require('./createPaymentIntent');
const { capturePayment } = require('./capturePayment');

module.exports = {
  createPaymentIntent,
  capturePayment
};
