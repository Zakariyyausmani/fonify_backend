const { body, validationResult } = require('express-validator');

/**
 * Centrally handles validation results from express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({
    message: 'Validation failed',
    errors: extractedErrors,
  });
};

/**
 * Auth Validation Schemas
 */
const registerValidationRules = () => {
  return [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ];
};

const loginValidationRules = () => {
  return [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ];
};

/**
 * Listing Validation Rules
 */
const listingValidationRules = () => {
  return [
    body('brand').notEmpty().withMessage('Brand is required'),
    body('model').notEmpty().withMessage('Model is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('condition').isIn(['New', 'Like New', 'Used', 'For Parts']).withMessage('Invalid condition'),
    body('location').notEmpty().withMessage('Location is required'),
  ];
};

module.exports = {
  validate,
  registerValidationRules,
  loginValidationRules,
  listingValidationRules,
};
