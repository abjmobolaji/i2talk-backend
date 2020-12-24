const { body, validationResult } = require('express-validator')

const reminderValidationRules = () => {
  return [
    body('title').isLength({ min: 5 }).withMessage('Title must have more than 5 characters'),
    body('message').isLength({ min: 10 }).withMessage('Message must have more than 10 characters')
  ]
}

const faqValidationRules = () => {
  return [
    body('question').isLength({ min: 10 }).withMessage('Question must have more than 10 characters'),
    body('answer').isLength({ min: 20 }).withMessage('Answer must have more than 20 characters')
  ]
}

// iSearch Validation
const iSearchValidation1Rules = () => {
  return [ 
    body('username_phone').not().isEmpty().withMessage('Input cannot be empty')
  ]
}

const iSearchValidation2Rules = () => {
  return [ 
    body('location').not().isEmpty().withMessage('cannot be empty')
    .isLength({ min: 3 }).withMessage('Location name must have more than 3 characters'),
    body('kilometer').not().isEmpty().withMessage('cannot be empty')
                     .matches(/\d/).withMessage('must contain a number'),
  ]
}

const iSearchValidation3Rules = () => {
  return [ 
    body('kilometer').not().isEmpty().withMessage('cannot be empty')
                     .matches(/\d/).withMessage('must contain a number'),
    body('latitude').not().isEmpty().withMessage('cannot be empty')
                     .matches(/\d/).withMessage('must contain a number'),
    body('longitude').not().isEmpty().withMessage('cannot be empty')
                     .matches(/\d/).withMessage('must contain a number')
  ]
}

const contactValidationRules = () => {
  return [
    body('customerName').isLength({ min: 5 }).withMessage('Name must have more than 5 characters'),
    body('customerEmail').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('customerSubject').not().isEmpty().withMessage('Subject cannot be empty')
                           .isLength({ min: 5 }).withMessage('Subject must have more than 5 characters'),
    body('customerMessage').not().isEmpty().withMessage('Message cannot be empty')
                           .isLength({ min: 15 }).withMessage(' must have more than 15 characters')
  ]
}

const userRegValidationRules = () => {
  return [
    body('username').isLength({ min: 5 }).withMessage('Username must have more than 5 characters'),
    body('fullName').isLength({ min: 6 }).withMessage('Full Name must have more than 6 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 8 }).withMessage('Password must be 8 chars+')
                       .matches(/\d/).withMessage('must contain a number'),
    body('countryCode').isLength({ min: 3 }).withMessage('Country Code Must Contain 3 digits')
                       .matches(/\d/).withMessage('Country Code Must be a number'),
    body('phone').isLength({ min: 10 }).withMessage('Phone number must be 10 digits'),
    body('sex').not().isEmpty().withMessage('Sex is required'),
    body('state').not().isEmpty().withMessage('State is required')
  ]
}

const userLoginValidationRules = () => {
  return [
    body('login').not().isEmpty().withMessage('Login is required'),
    body('password').not().isEmpty().withMessage('Password is required')
  ]
}

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

  return res.status(422).json({
    errors: extractedErrors,
  })
}

module.exports = {
  reminderValidationRules,
  faqValidationRules,
  contactValidationRules,
  iSearchValidation1Rules,
  iSearchValidation2Rules,
  iSearchValidation3Rules,
  userRegValidationRules,
  userLoginValidationRules,
  validate
}
