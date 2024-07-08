const { body, validationResult } = require('express-validator');

const validateUser = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required'),
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .notEmpty()
    .withMessage('Email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('phone')
    .optional()
    .isString()
    .withMessage('Phone must be a string'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];

module.exports = validateUser;
