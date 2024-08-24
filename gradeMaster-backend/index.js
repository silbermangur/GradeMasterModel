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
// { force: true }
sequelize.sync()
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



// API route to get a spacific user
// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email } = req.body;

        // Find the teacher by email and password
        const teacher = await Teacher.findOne({ where: { email } });

        if (!teacher) {
            return res.status(404).json({ message: 'Invalid email or password' });
        }

        // Login successful
        res.json({ message: 'Login successful', teacher });

    } catch (error) {
        res.status(500).json({ message: 'Error logging in: ' + error.message });
    }
});


// API route to create a new course with associated exams and assignments
app.post('/api/classes', async (req, res) => {
    try {
        const { 
            className, 
            classCode, 
            classCredit, 
            attendanceWeight,
            teacherId,
        } = req.body;

        // Create the course
        const course = await Course.create({
            courseName: className,
            courseCode: classCode,
            credits: classCredit,
            attendanceWeight: attendanceWeight,
            teacherId : teacherId  // Associate course with the teacher,
        });

        res.status(201).json({ message: 'Course, exam, and assignments created successfully!', course });
    } catch (error) {
        res.status(500).json({ message: 'Error creating course: ' + error.message });
    }
});


// API route to create a new course with associated exams and assignments
app.post('/api/examAssinmemnt', async (req, res) => {
    try {
        const { 
            exam,
            assignments,
            CourseId,
        } = req.body;

        
        const course = await Course.findByPk(CourseId)

        // Validate the total weight
        const totalWeight = parseFloat(course.attendanceWeight) + parseFloat(exam.examWeight) + assignments.reduce((acc, assignment) => acc + parseFloat(assignment.assignmentWeight), 0);
        if (totalWeight !== 1) {
            return res.status(400).json({ message: 'Total weight of assignments, exam, and attendance must equal 1.' });
        }
        
        // Create the exam associated with the course
        const newExam = await Exam.create({
            examName: exam.examName,
            description: exam.examDescription,
            examDate: exam.examDate,
            examWight: exam.examWeight,
            courseId: CourseId, // Associate exam with the course
        });

        // Create assignments associated with the course
        for (const assignment of assignments) {
            await Assignment.create({
                assignmentName: assignment.assignmentName,
                description: assignment.assignmentDescription,
                dueDate: assignment.assignmentDate,
                assignmentWight: assignment.assignmentWeight,
                courseId: CourseId, // Associate assignment with the course
            });
        }
        
        res.status(201).json({ message: 'Course, exam, and assignments created successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating course: ' + error.message });
    }
});


app.post('/api/students', async (req, res) => {
    try {
        const { firstName, lastName, dateOfBirth, gender, phoneNumber, address, email, enrollmentDate } = req.body;

        // Create a new student
        const newStudent = await Student.create({
            firstName,
            lastName,
            dateOfBirth,
            gender,
            phoneNumber,
            address,
            email,
            enrollmentDate
        });

        res.status(201).json(newStudent);
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ message: 'Error creating student: ' + error.message });
    }
});


app.post('/api/attendance', async (req, res) => {
    try {
        const { studentId, courseId, status, date } = req.body;

        const attendance = await Attendance.create({
            studentId,
            courseId,
            status,
            date
        });

        res.status(201).json(attendance);
    } catch (error) {
        console.error('Error creating attendance:', error);
        res.status(500).json({ message: 'Error creating attendance: ' + error.message });
    }
});

// API route to get all courses of a teacher
app.get('/api/teacher/:teacherId/courses', async (req,res)=> {
    try {
        const {teacherId} = req.params;

        // Fetch the courses for the given teacherId
        const courses = await Course.findAll({ where: { teacherId } });

        if (!courses || courses.length === 0) {
            return res.status(404).json({ message: 'No courses found for this teacher.' });
        }

        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses: ' + error.message });
    }
})


// API route to get all teachers
app.get('/api/teachers', async (req, res) => {
    try {
        const teachers = await Teacher.findAll();
        res.json(teachers);
    } catch (error) {
        res.status(500).send('Error fetching teachers: ' + error.message);
    }
});

// API route to get all courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.findAll();
        res.json(courses);
    } catch (error) {
        res.status(500).send('Error fetching courses: ' + error.message);
    }
});

// API route to get all assignments
app.get('/api/assignments', async (req, res) => {
    try {
        const assignments = await Assignment.findAll();
        res.json(assignments);
    } catch (error) {
        res.status(500).send('Error fetching assignments: ' + error.message);
    }
});


// API route to get all exams
app.get('/api/exams', async (req, res) => {
    try {
        const exams = await Exam.findAll();
        res.json(exams);
    } catch (error) {
        res.status(500).send('Error fetching exams: ' + error.message);
    }
});


// API route to get all exams
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.findAll();
        res.json(students);
    } catch (error) {
        res.status(500).send('Error fetching exams: ' + error.message);
    }
});

// API route to get all exams
app.get('/api/attendance', async (req, res) => {
    try {
        const attendances = await Attendance.findAll();
        res.json(attendances);
    } catch (error) {
        res.status(500).send('Error fetching exams: ' + error.message);
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

