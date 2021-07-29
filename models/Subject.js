const mongoose = require('mongoose');

const SubjectSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
    }
})

module.exports = mongoose.model('Subjects', SubjectSchema);