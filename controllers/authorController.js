const Author = require("../models/author");
const Book = require("../models/book")
const asyncHandler = require('express-async-handler');
const {body, validationResult} = require("express-validator");
const authorValidationRule = require('../validations/authorValidation')


// Display list of all Authors.
// 使用asyncHandler封裝異步函數，這假設您已經有一個用於錯誤處理的中間件。
exports.author_list = asyncHandler(async (req, res, next) => {
    // 直接等待查詢的結果，無需使用exec()
    const allAuthors = await Author.find().sort({family_name: 1});
    // 使用查詢結果渲染視圖
    res.render("author_list", {
        title: "Author List",
        author_list: allAuthors,
    });
});


// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
    try {
        // 使用 Promise.all 来同时执行两个查询
        const [author, authorsBooks] = await Promise.all([
            // 查询作者详细信息
            Author.findById(req.params.id),
            // 查询该作者的所有书籍，仅返回标题和摘要
            Book.find({'author': req.params.id}, 'title summary')
        ]);

        if (author === null) { // 如果没有找到作者
            const err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }

        // 查询成功，渲染作者详情页面
        res.render('author_detail', {
            title: 'Author Detail',
            author: author,
            author_books: authorsBooks
        });
    } catch (err) {
        return next(err);
    }
});


// Display Author create form on GET.
exports.author_create_get = (req, res, next) => {
    res.render('author_form', {title: 'Create Author'})
}

// Handle Author create on POST.
exports.author_create_post = [
    // Validate and sanitize fields.
    authorValidationRule,

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req)

        //Create Author object with escaped and trimmed data
        const author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
        })

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('author_form', {
                title: 'Create Author',
                author: author,
                errors: errors.array(),
            })
            return
        } else {
            // Date from form is valid.

            // Save author.
            await author.save()
            // Redirect to new author record.
            res.redirect(author.url)
        }
    })
]

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
    // Get details of author and all their books (in parallel)
    const [author, allBooksByAuthor] = await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({author: req.params.id}, "title summary").exec(),
    ]);

    if (author === null) {
        // No results.
        res.redirect("/catalog/authors");
    }

    res.render("author_delete", {
        title: "Delete Author",
        author: author,
        author_books: allBooksByAuthor,
    });
});


// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
    // Get details of author and all their books (in parallel)
    const [author, allBooksByAuthor] = await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({author: req.params.id}, "title summary").exec(),
    ]);

    if (allBooksByAuthor.length > 0) {
        // Author has books. Render in same way as for GET route.
        res.render("author_delete", {
            title: "Delete Author",
            author: author,
            author_books: allBooksByAuthor,
        });
        return;
    } else {
        // Author has no books. Delete object and redirect to the list of authors.
        await Author.findByIdAndDelete(req.body.authorid);
        res.redirect("/catalog/authors");
    }
});


// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
    const author = await Author.findById(req.params.id).exec()
    console.log(author.date_of_birth)
    if (author) {
        author.date_of_birth = author.date_of_birth_yyyy_mm_dd
    }
    res.render('author_form', {title: 'Update Author', author: author})
})

// Handle Author update on POST.
exports.author_update_post = [
    // Validation
    authorValidationRule,
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        // Error render
        if (!errors.isEmpty()) {
            // Re-render the form with the current author and errors
            res.render('author_form', {
                title: 'Update Author',
                author: req.body, // you can directly pass the req.body if it only contains author fields
                errors: errors.array(),
            });
            return;
        } else {
            // Recover update data
            const authorToUpdate = await Author.findById(req.params.id).exec();
            if (!authorToUpdate) {
                const err = new Error("Author not found");
                err.status = 404;
                return next(err);
            }
            // Update fields
            authorToUpdate.first_name = req.body.first_name;
            authorToUpdate.family_name = req.body.family_name;
            authorToUpdate.date_of_birth = req.body.date_of_birth? new Date(req.body.date_of_birth) : null
            authorToUpdate.date_of_death = req.body.date_of_death ? new Date(req.body.date_of_death) : null
            // Save the updated author
            const updatedAuthor = await authorToUpdate.save();
            // Redirect to the author's URL
            res.redirect(updatedAuthor.url);
        }
    }),
];

