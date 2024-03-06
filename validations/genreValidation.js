const {body, validationResult} = require("express-validator")
const {model} = require("mongoose");
const genreValidationsRule = [
    body("name", "Genre name must contain at least 3 characters")
        .trim()
        .isLength({min: 3})
        .escape(),
]
module.exports = genreValidationsRule