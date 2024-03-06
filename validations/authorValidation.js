const {body, validationResult} = require("express-validator")
const authorValidationRule = [
    body('first_name')
        .trim()
        .isLength({min: 1})
        .escape()
        .withMessage('First name must be specified.')
        .isAlphanumeric()
        .withMessage('First name has non-alphanumeric characters.'),
    body('family_name')
        .trim()
        .isLength({min: 1})
        .escape()
        .withMessage('Family name must be specified.')
        .isAlphanumeric()
        .withMessage('Family name has non-alphanumeric characters.'),
    body("date_of_birth", "Invalid date of birth")
        .optional({values: "falsy"})
        .isISO8601()
        .toDate(),
    body("date_of_death", "Invalid date of death")
        .optional({values: "falsy"})
        .isISO8601()
        .toDate(),
]
module.exports = authorValidationRule