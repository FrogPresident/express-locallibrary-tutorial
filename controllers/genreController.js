const Genre = require("../models/genre");
const Book = require("../models/book")
const asyncHandler = require("express-async-handler");
const {body, validationResult} = require("express-validator")
const genreValidationsRule = require('../validations/genreValidation')

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
    // Get the all genre first
    const list_genre = await Genre.find().populate("name")
    res.render("genre_list", {
        title: "Genre List",
        genre_list: list_genre
    })
})

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
    const [genre,
        booksInGenre
    ] = await Promise.all([
        Genre.findById(req.params.id).exec(),
        Book.find({genre: req.params.id}, "title summary").exec(),
    ])
    console.log(booksInGenre)
    if (genre === null) {
        // No results.
        const err = new Error("Genre not found");
        err.status = 404;
        return next(err);
    }

    res.render("genre_detail", {
        title: "Genre Detail",
        genre: genre,
        genre_books: booksInGenre,
    })
})

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
    res.render("genre_form", {title: "Create Genre"});
};

// Handle Genre create on POST.
exports.genre_create_post = [
    // Validate and sanitize the name field.
    genreValidationsRule,

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        const genre = new Genre({name: req.body.name});

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render("genre_form", {
                title: "Create Genre",
                genre: genre,
                errors: errors.array(),
            });
            return;
        } else {
            // Data from form is valid.
            // Check if Genre with same name already exists.
            const genreExists = await Genre.findOne({name: req.body.name}).exec();
            if (genreExists) {
                // Genre exists, redirect to its detail page.
                res.redirect(genreExists.url);
            } else {
                await genre.save();
                // New genre saved. Redirect to genre detail page.
                res.redirect(genre.url);
            }
        }
    }),
];


// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
    const [
        genre,
        allBooksByGenre
    ] = await Promise.all([
        Genre.findById(req.params.id).exec(),
        Book.find({genre: req.params.id}, "title summary").exec(),
    ])
    if (genre === null) {
        res.redirect('/catalog/genres')
    }
    console.log(allBooksByGenre)
    res.render('genre_delete', {title: 'Delete Genre', genre: genre, genre_books: allBooksByGenre})
})

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
    const [
        genre,
        allBooksByGenre
    ] = await Promise.all([
        Genre.findById(req.params.id).exec(),
        Book.find({genre: req.params.id}, "title summary").exec(),
    ])

    if (allBooksByGenre.length > 0) {
        res.render('genre_delete', {title: 'Delete Genre', genre: genre, genre_books: allBooksByGenre,})
        return
    } else {
        await Genre.findByIdAndDelete(req.body.genreid)
        res.redirect('/catalog/genres')
    }
})

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
    const genre = await Genre.findById(req.params.id).exec()
    res.render('genre_form', {title: 'Update Genre', genre: genre})
})

// Handle Genre update on POST.
// exports.genre_update_post = [
//     genreValidationsRule,
//     asyncHandler(async (req, res, next) => {
//         const errors = validationResult(req)
//         const genre = new Genre({
//             name: req.body.name,
//         })
//         if (!errors.isEmpty()) {
//             res.render('genre_form', {title: 'Update Genre', genre: genre})
//             return
//         } else {
//             const updatedGenre = await Genre.findByIdAndUpdate(req.params.id, genre, {})
//             res.redirect(updatedGenre.url)
//         }
//     })
// ]
exports.genre_update_post = [
    genreValidationsRule,
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Re-render the form with errors and the current genre data
            res.render('genre_form', {
                title: 'Update Genre',
                genre: {_id: req.params.id, name: req.body.name},
                errors: errors.array(),
            });
            return;
        } else {
            // Update the genre with new data
            const genreToUpdate = await Genre.findById(req.params.id).exec();
            if (!genreToUpdate) {
                // handle error if genre not found
                const err = new Error("Genre not found");
                err.status = 404;
                return next(err);
            }
            genreToUpdate.name = req.body.name;
            const updatedGenre = await genreToUpdate.save();
            res.redirect(updatedGenre.url);
        }
    })
];

