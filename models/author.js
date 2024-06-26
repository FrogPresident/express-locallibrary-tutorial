var mongoose = require('mongoose')
const moment = require("moment/moment");
var Schema = mongoose.Schema
var AuthorSchema = new Schema({
    first_name: {
        type: String,
        require: true,
        max: 100
    },
    family_name: {
        type: String,
        require: true,
        max: 100
    },
    date_of_birth: {
        type: Date
    },
    date_of_death: {
        type: Date
    }
})

// Virtual for author's full name

AuthorSchema.virtual('name').get(function () {
    return this.family_name + ',' + this.first_name
})

// Virtual for author's URL

AuthorSchema.virtual('url').get(function () {
    return '/catalog/author/' + this._id
})

AuthorSchema.virtual("date_of_birth_formatted").get(function () {
    return moment(this.date_of_birth).format("MMMM Do, YYYY");
})

AuthorSchema.virtual("date_of_death_formatted").get(function () {
    return moment(this.date_of_death).format("MMMM Do, YYYY");
})
AuthorSchema.virtual("lifespan").get(function () {
    let lifeString = "";
    if (this.date_of_birth) {
        lifeString = this.date_of_birth_formatted;
    }
    lifeString += " - ";
    if (this.date_of_death) {
        lifeString += this.date_of_death_formatted;
    }
    return lifeString;
});
AuthorSchema.virtual("date_of_birth_yyyy_mm_dd").get(function () {
    return this.date_of_birth ? moment(this.date_of_birth).format("YYYY-MM-DD") : '';
})
AuthorSchema.virtual("date_of_death_yyyy_mm_dd").get(function () {
    return this.date_of_death ? moment(this.date_of_death).format("YYYY-MM-DD") : '';
})


//export model

module.exports = mongoose.model('Author', AuthorSchema)