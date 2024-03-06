const {body, validationResult} = require("express-validator")
const bookValidationRule = [
    body("title", "Title must not be empty.")
        .trim()
        .isLength({min: 1})
        .escape(),
    body("author", "Author must not be empty.")
        .trim()
        .isLength({min: 1})
        .escape(),
    body("summary", "Summary must not be empty.")
        .trim()
        .isLength({min: 1})
        .escape(),
    body("isbn", "ISBN must not be empty").trim().isLength({min: 1}).escape(),
    body("genre.*").escape(),
]
module.exports = bookValidationRule