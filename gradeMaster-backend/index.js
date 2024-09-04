// Import necessary modules
const express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');
const bcrypt =  require('bcrypt');

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

Course.hasMany(Assignment, { foreignKey: 'courseId' });
Course.hasMany(Exam, { foreignKey: 'courseId' });

Assignment.hasMany(AssignmentSubmission, { foreignKey: 'assignmentId' });
Student.hasMany(AssignmentSubmission, { foreignKey: 'studentId' });

Exam.hasMany(ExamSubmission, { foreignKey: 'examId' });
Student.hasMany(ExamSubmission, { foreignKey: 'studentId' });

Student.hasMany(Attendance, { foreignKey: 'studentId' });
Course.hasMany(Attendance, { foreignKey: 'courseId' });


Student.hasMany(Enrollment, { foreignKey: 'studentId' });
Course.hasMany(Enrollment, { foreignKey: 'courseId' });
Enrollment.belongsTo(Student, { foreignKey: 'studentId' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;


// Middleware to parse JSON
app.use(express.json());
app.use(cors());


// Import routes
const teacherRoutes = require('./routes/teachers');
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const attendanceRoutes = require('./routes/attendance');
const enrollmentRoutes = require('./routes/enrollment');
const assignmentExamController = require('./routes/assignmentsExams');
const submissionRoutes = require('./routes/submission');

// Use routes
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/assignmentsExams', assignmentExamController);
app.use('/api/submissions', submissionRoutes);

// Sync the model with the database (creating the table if it doesn't exist)
// {force: true}
sequelize.sync({force: true}) 
    .then(() => {
        console.log('Database & tables created!');
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });

// API route to get a spacific user
// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email , password } = req.body;

        // Find the teacher by email and password
        const teacher = await Teacher.findOne({ where: { email } });

        if (!teacher) {
            return res.status(404).json({ message: 'Invalid email or password' });
        }

         // Compare the hashed password
        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
       

        // Login successful
        res.json({ message: 'Login successful', teacher });

    } catch (error) {
        res.status(500).json({ message: 'Error logging in: ' + error.message });
    }
});

// Default route to check if the server is running
app.get('/', (req, res) => {
    res.send('GradeMaster Backend is running...');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

