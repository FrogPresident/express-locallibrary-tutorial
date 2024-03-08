const BookInstance = require("../models/bookinstance");
const Book = require('../models/book')
const asyncHandler = require("express-async-handler")
const {promiseCallback} = require("async/internal/promiseCallback");
const bookInstanceValidationRule = require('../validations/bookInstanceValidation')
const {validationResult} = require("express-validator");

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
    const list_bookinstances = await BookInstance.find().populate("book")
    res.render("bookinstance_list", {title: "Book Instance List", bookinstance_list: list_bookinstances})
});


// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
    const bookinstance = await BookInstance.findById(req.params.id).populate('book')
    if (bookinstance === null) {
        const err = new Error('bookinstance is not found')
        err.status = 404
        return next(err)
    }
    res.render('bookinstance_detail', {title: 'Book:', bookinstance: bookinstance})
})

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
    const [
        allBooks,
        allBookInstances
    ] = await Promise.all([
        Book.find().sort({name: 1}).exec(),
        BookInstance.find().sort({status: 1}).exec()
    ])
    res.render('bookinstance_form', {
        title: 'Create Book Instance',
        book_list: allBooks,
        bookinstance: allBookInstances
    })
})

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    bookInstanceValidationRule,
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req)
        const bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
        })
        if (!errors.isEmpty()) {
            // There are errors.
            // Render form again with sanitized values and error messages.
            const allBooks = await Book.find({}, "title").sort({title: 1}).exec();

            res.render("bookinstance_form", {
                title: "Create BookInstance",
                book_list: allBooks,
                selected_book: bookInstance.book._id,
                errors: errors.array(),
                bookinstance: bookInstance,
            });
            return;
        } else {
            await bookInstance.save()
            res.redirect(bookInstance.url)
        }
    })
]

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
    const bookinstance = await BookInstance.findById(req.params.id).exec()
    if (bookinstance === null) {
        res.redirect('catalog/bookinstances')
    }
    res.render('bookinstance_delete', {title: 'Book Instance Delete', bookinstance: bookinstance})
})

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
    const bookinstance = await BookInstance.findById(req.params.id).exec()
    await BookInstance.findByIdAndDelete(req.params.id).exec()
    res.redirect('/catalog/bookinstances')
})

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
    const [
        bookInstance,
        allBooks
    ] = await Promise.all([
        BookInstance.findById(req.params.id).populate('book').exec(),
        Book.find().sort({title: 1}).exec(),
    ])
    if (bookInstance === null) {
        // No results.
        const err = new Error("BookInstance not found");
        err.status = 404;
        return next(err);
    }
    if (bookInstance) {
        bookInstance.due_back = bookInstance.due_back_yyyy_mm_dd
    }
    console.log(bookInstance.imprint)
    res.render('bookinstance_form', {
        title: 'Update Book Instance',
        book_list: allBooks,
        bookinstance: bookInstance,
        selected_book: bookInstance.book._id.toString()
    })
})


// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
    // Sanitization
    bookInstanceValidationRule,
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const allBooks = await Book.find().sort({title: 1}).exec()
        // Error render
        if (!errors.isEmpty()) {
            res.render('bookinstance_form', {
                title: 'Update Book Instance',
                book_list: allBooks,
                bookinstance: req.body, // you can directly pass the req.body if it only contains author fields
                errors: errors.array(),
            });
            return;
        } else {
            // Recover update data
            const bookInstanceToUpdate = await BookInstance.findById(req.params.id).exec();
            if (!bookInstanceToUpdate) {
                const err = new Error("book instance not found");
                err.status = 404;
                return next(err);
            }
            // Update fields
            bookInstanceToUpdate.book = req.body.book
            bookInstanceToUpdate.imprint = req.body.imprint
            bookInstanceToUpdate.status = req.body.status
            bookInstanceToUpdate.due_back = req.body.due_back
            const updatedBookInstance = await bookInstanceToUpdate.save()
            res.redirect(updatedBookInstance.url)

        }
    })
]
