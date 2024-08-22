// Import necessary modules
const express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');

// Import models
const Teacher = require('./models/teacher');
const Student = require('./models/student');
const Course = require('./models/course');
const Attendance = require('./models/attendance');
const Enrollment = require('./models/enrollment');
const Assignment = require('./models/assignment');
const Exam = require('./models/exam');
const AssignmentSubmission = require('./models/assignmentSubmission');
const ExamSubmission = require('./models/examSubmission');

// Set up associations
Teacher.hasMany(Course, { foreignKey: 'teacherId' });
Course.belongsTo(Teacher, { foreignKey: 'teacherId' });

Student.belongsToMany(Course, { through: Enrollment });
Course.belongsToMany(Student, { through: Enrollment });

Course.hasMany(Assignment, { foreignKey: 'courseId' });
Course.hasMany(Exam, { foreignKey: 'courseId' });

Assignment.hasMany(AssignmentSubmission, { foreignKey: 'assignmentId' });
Student.hasMany(AssignmentSubmission, { foreignKey: 'studentId' });

Exam.hasMany(ExamSubmission, { foreignKey: 'examId' });
Student.hasMany(ExamSubmission, { foreignKey: 'studentId' });

Student.hasMany(Attendance, { foreignKey: 'studentId' });
Course.hasMany(Attendance, { foreignKey: 'courseId' });


// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;


// Middleware to parse JSON
app.use(express.json());
app.use(cors());


// Sync the model with the database (creating the table if it doesn't exist)
sequelize.sync({force: true})
    .then(() => {
        console.log('Database & tables created!');
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });

// API route to create a new teacher
app.post('/api/teachers', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phoneNumber } = req.body;
        const newTeacher = await Teacher.create({ firstName, lastName, email, password, phoneNumber });
        res.json(newTeacher);
    } catch (error) {
        res.status(500).send('Error creating teacher: ' + error.message);
    }
});

// API route to get all teachers
app.get('/api/teachers', async (req, res) => {
    try {
        const teachers = await Teacher.findAll();
        res.json(teachers);
    } catch (error) {
        res.status(500).send('Error fetching teachers: ' + error.message);
    }
});

// Default route to check if the server is running
app.get('/', (req, res) => {
    res.send('GradeMaster Backend is running...');
});

// A simple GET method to check if the API is working
app.get('/api/check', (req, res) => {
    res.json({ message: 'API is working correctly!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

