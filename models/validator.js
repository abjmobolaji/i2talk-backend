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
  validate
}
