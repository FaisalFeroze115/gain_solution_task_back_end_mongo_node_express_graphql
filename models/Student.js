const mongoose = require('mongoose');
const schema = mongoose.Schema;

const StudentSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    phone: String,
    dob: {
        type: Date
    },
    // results: {
    //     bsonType: "array",
    //     subject_id: {
    //         bsonType: "string",
    //     }
    // }
    student_subject: {
        type: Array,
    }
    // student_subject: [
    //     {
    //         type: schema.Types.ObjectId,
    //         ref: 'Subjects'
    //     }
    // ]
})

module.exports = mongoose.model('Students', StudentSchema);