let mongoose = require('mongoose')

//Page Schema

let PageSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
       
    },
    content: {
        type: String,
        required: true
    },
    sorting: {
        type: Number,
       
    }
}
,
    { timestamps: true }
);

let Page = module.exports = mongoose.model('Page', PageSchema)