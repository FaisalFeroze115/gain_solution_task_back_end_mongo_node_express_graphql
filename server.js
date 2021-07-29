const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,

} = require('graphql')

const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv/config')

const Student = require('./models/Student')
const Subject = require('./models/Subject')

const app = express()
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('We are on HOME');
})


const StudentSubjectType = new GraphQLObjectType({
    name: 'StudentSubjectType',
    fields: {
      subject_id: {
        type: GraphQLString
        // resolve: () => {
        //     const v = "rrrrr"
        // }
      }
  }});

const StudentType = new GraphQLObjectType({
    name: 'Student', 
    description: 'This represent a student',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLString)  },
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        phone: { type: GraphQLString },
        dob: { type: GraphQLString },
        student_subject: { 
            type: new GraphQLList(StudentSubjectType),
            //type: GraphQLString,
         },
        subject: {
            type: GraphQLList(SubjectType),
            resolve: async (students) => {
                //const subjects = await Subject.find({_id: ['61006ef7b13a7137e432ca1d','61007457dacd801200b46390'] });
                const st_sub = students.student_subject;
                const sub_id_array = [];
                st_sub.map(sub_id =>{sub_id_array.push(sub_id.subject_id)});
                const subjects = await Subject.find({_id: sub_id_array });
                //const s = await Student.find({subject_id: '61006ef7b13a7137e432ca1d'})
                return subjects
            }
        }
    })
}) //Student.find()

const SubjectType = new GraphQLObjectType({
    name: 'Subject',
    description: 'This represent a subject',
    fields: ()=> ({
        _id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        students: {
            type: GraphQLList(StudentType),
            resolve: async (subjects) => {
                const allStudents = await Student.find({"student_subject.subject_id" : subjects.id });
                //const s = await Student.find({subject_id: '61006ef7b13a7137e432ca1d'})
                return allStudents
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () =>({
        students: {
            type: new GraphQLList(StudentType),
            description: 'List of Students',
            resolve: async () => {
                //await Student.find()
                const students = await Student.find();
                return students
            } 
        },
        subjects: {
            type: new GraphQLList(SubjectType),
            description: 'List of Subjects',
            resolve: async () => {
                // const students = await Subject.find();
                // return students
                const subjects = await Subject.find();
                return subjects
            } 
        }
    })
})


const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addSubject: {
            type: SubjectType,
            description: 'Add a Subject',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: async (parent, args) => {
                const subject = new Subject({
                    name: args.name,
                })
                const saveSubject = await subject.save();
                return saveSubject
            }
        },
        addStudent: {
            type: StudentType,
            description: 'Add a Student',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLNonNull(GraphQLString) },
                phone: { type: GraphQLString },
                dob: { type: GraphQLString },    
                //subject_id: { type: GraphQLString}
                subject_id: { type: GraphQLString }
            },
            resolve: async (parent, args) => {
                const student = new Student({
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                    dob: args.dob,
                    //subject_id: args.subject_id
                    student_subject: {subject_id: args.subject_id}
                })
                const saveStudent = await student.save();
                return saveStudent

            }
        },
        addSubjectToStudent: {
            type: StudentType,
            description: 'Add a Subject to a Student',
            args: {
                subject_id: { type: GraphQLString},
                _id : { type: GraphQLString }
            },
            resolve: async (parent, args) => {
                const updateStudent = await Student.update({_id: args._id}, {$push: {
                        student_subject: [
                            {subject_id: args.subject_id}
                        ]
                    }
                });
                //const message = {message: "Subject added"}
                //const editedStudent = await Student.find({ _id: args._id})
                return updateStudent

            }
        },
        updateSubject: {
            type: GraphQLString,
            description: 'Update a Subject',
            args: {
                name: { type: GraphQLString},
                _id : { type: GraphQLString }
            },
            resolve: async (parent, args) => {
                const updateSubject = await Subject.updateOne({_id: args._id}, {$set: {
                    name: args.name
                }});
                //return updateSubject
            }
        },
        updateStudent: {
            type: GraphQLString,
            description: 'Update a Student',
            args: {
                name: { type: GraphQLString},
                _id : { type: GraphQLString },
                email : { type: GraphQLString },
                phone : { type: GraphQLString },
                dob : { type: GraphQLString },
            },
            resolve: async (parent, args) => {
                const updateStudent = await Student.updateOne({_id: args._id}, {$set: {
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                    dob: args.dob,
                }});
            }
        },
        deleteStudent: {
            type: GraphQLString,
            description: 'Delete a Student',
            args: {
                _id : { type: GraphQLString }
            },
            resolve: async (parent, args) => {
                const removeStudent = await Student.remove({_id: args._id});
            }
        },
        deleteSubject: {
            type: GraphQLString,
            description: 'Delete a Subject',
            args: {
                _id : { type: GraphQLString }
            },
            resolve: async (parent, args) => {
                const removeSubject = await Subject.remove({_id: args._id});
                const removeSubjectFromStudent = await Student.update({}, {$pull: {student_subject: {subject_id: args._id}}
                }, {multi: true});
            }
        },
        deleteSubjectFromStudent: {
            type: GraphQLString,
            description: 'Delete a Subject from student',
            args: {
                student_id : { type: GraphQLString },
                subject_id : { type: GraphQLString },
            },
            resolve: async (parent, args) => {
                const removeSubjectFromStudent = await Student.update({_id: args.student_id}, {$pull: {
                    student_subject: {subject_id: args.subject_id}
                }
                });
            }
        }




    })
})



const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))

mongoose.connect(
    process.env.DB_CONNECTION,
    { useUnifiedTopology: true },()=>{
    console.log('connected to DB !!');
});

app.listen(5000, () => console.log('Server Running on port 5000'))