const {body, validationResult} = require("express-validator")
const bookInstanceValidationRule = [
    body("book", "Book must be specified").trim().isLength({min: 1}).escape(),
    body("imprint", "Imprint must be specified")
        .trim()
        .isLength({min: 1})
        .escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
        .optional({values: "falsy"})
        .isISO8601()
        .toDate(),
]
module.exports = bookInstanceValidationRule