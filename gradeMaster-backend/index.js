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

// Use routes
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);

// Sync the model with the database (creating the table if it doesn't exist)
// {force: true}
sequelize.sync({force: true})
    .then(() => {
        console.log('Database & tables created!');
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });

    /*
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

*/

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

/*
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
*/

app.post('/api/enrollment', async (req, res) => {
    try {
        const { studentId, courseId, enrollmentDate, finalGrade } = req.body;

        const enrollment = await Enrollment.create({
            studentId,
            courseId,
            enrollmentDate,
            finalGrade,
        });
        
        res.status(201).json(enrollment);
    } catch (error) {
        console.error('Error creating enrollment:', error);
        res.status(500).json({ message: 'Error creating enrollment: ' + error.message });
    }
});

app.put('/api/attendance', async (req, res) => {
    const { studentId, courseId, date, status } = req.body;
    try {
        // Find the existing attendance record
        const attendance = await Attendance.findOne({
            where: { studentId, courseId }
        });

        if (attendance) {
            // Update the status
            attendance.status = status;
            await attendance.save();
            res.status(200).json(attendance);
        } else {
            res.status(404).json({ message: 'Attendance record not found' });
        }
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ message: 'Error updating attendance: ' + error.message });
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

app.get('/api/courses/:courseId/enrolled-students', async (req, res) => {
    try {
        const { courseId } = req.params;

        // Fetch students enrolled in the course
        const students = await Student.findAll({
            include: [{
                model: Enrollment,
                where: { courseId }
            }]
        });

        if (!students || students.length === 0) {
            return res.status(404).json({ message: 'No students found for this course.' });
        }

        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching students: ' + error.message });
    }
});

app.get('/api/courses/:courseId/assignments-exams', async (req, res) => {
    const { courseId } = req.params;
    try {
        const assignments = await Assignment.findAll({ where: { courseId } });
        const exams = await Exam.findAll({ where: { courseId } });

        const assignmentsExams = [
            ...assignments.map(a => ({ id: a.id, assignmentName: a.assignmentName, type: 'assignment' })),
            ...exams.map(e => ({ id: e.id, examName: e.examName, type: 'exam' }))
        ];

        res.json(assignmentsExams);
    } catch (error) {
        console.error('Error fetching assignments and exams:', error);
        res.status(500).json({ message: 'Error fetching assignments and exams: ' + error.message });
    }
});

app.get('/api/courses/:courseId/grades', async (req, res) => {
    const { courseId } = req.params;
    const { assignmentExamId, type } = req.query;

    try {
        const students = await Student.findAll({
            include: [
                {
                    model: Enrollment,
                    where: { courseId }
                },
                {
                    model: type === 'assignment' ? AssignmentSubmission : ExamSubmission,
                    where: { [type === 'assignment' ? 'assignmentId' : 'examId']: assignmentExamId },
                    required: false // Optional: includes students without grades
                }
            ]
        });

        const gradesData = students.map(student => ({
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            grade: type === 'assignment'
                ? student.AssignmentSubmissions.length > 0 ? student.AssignmentSubmissions[0].pointsEarned : null
                : student.ExamSubmissions.length > 0 ? student.ExamSubmissions[0].pointsEarned : null
        }));

        res.json({ students: gradesData });
    } catch (error) {
        console.error('Error fetching grades:', error);
        res.status(500).json({ message: 'Error fetching grades: ' + error.message });
    }
});



app.get('/api/courses/:courseId/attendance', async (req, res) => {
    const { courseId } = req.params;
    try {
        const dates = await Attendance.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('date')), 'date']],
            where: { courseId },
            order: [['date', 'ASC']]
        });

        const students = await Student.findAll({
            include: {
                model: Enrollment,
                where: { courseId }
            }
        });

        const attendanceData = students.map(student => {
            const attendance = {};
            dates.forEach(date => {
                attendance[date.date] = 'N/A'; // Default value if no record exists
            });
            return { id: student.id, firstName: student.firstName, lastName: student.lastName, attendance };
        });

        for (const student of attendanceData) {
            const records = await Attendance.findAll({
                where: { studentId: student.id, courseId }
            });
            records.forEach(record => {
                student.attendance[record.date] = record.status;
            });
        }

        res.json({ students: attendanceData, dates: dates.map(d => d.date) });
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        res.status(500).json({ message: 'Error fetching attendance data: ' + error.message });
    }
});



app.post('/api/attendance', async (req, res) => {
    const { studentId, courseId, date, status } = req.body;
    try {
        const [attendance, created] = await Attendance.findOrCreate({
            where: { studentId, courseId, date },
            defaults: { status }
        });

        if (!created) {
            attendance.status = status;
            await attendance.save();
        }

        res.status(200).json(attendance);
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ message: 'Error updating attendance: ' + error.message });
    }
});

app.post('/api/assignment-submissions', async (req, res) => {
    const { assignmentId, studentId, pointsEarned } = req.body;
    try {
        const submission = await AssignmentSubmission.findOne({
            where: { assignmentId, studentId }
        });

        if (submission) {
            submission.pointsEarned = pointsEarned;
            await submission.save();
            res.status(200).json(submission);
        } else {
            const newSubmission = await AssignmentSubmission.create({
                assignmentId,
                studentId,
                pointsEarned,
                submissionDate: new Date()
            });
            res.status(201).json(newSubmission);
        }
    } catch (error) {
        console.error('Error saving assignment submission:', error);
        res.status(500).json({ message: 'Error saving assignment submission: ' + error.message });
    }
});

app.post('/api/exam-submissions', async (req, res) => {
    const { examId, studentId, pointsEarned } = req.body;
    try {
        const submission = await ExamSubmission.findOne({
            where: { examId, studentId }
        });

        if (submission) {
            submission.pointsEarned = pointsEarned;
            await submission.save();
            res.status(200).json(submission);
        } else {
            const newSubmission = await ExamSubmission.create({
                examId,
                studentId,
                pointsEarned,
                submissionDate: new Date()
            });
            res.status(201).json(newSubmission);
        }
    } catch (error) {
        console.error('Error saving exam submission:', error);
        res.status(500).json({ message: 'Error saving exam submission: ' + error.message });
    }
});


app.get('/api/courses/:courseId/students', async (req, res) => {
    const { courseId } = req.params;
    try {
        const students = await Student.findAll({
            include: {
                model: Enrollment,
                where: { courseId }
            }
        });

        if (!students || students.length === 0) {
            return res.status(404).json({ message: 'No students found for this course.' });
        }

        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching students: ' + error.message });
    }
});

app.get('/api/courses/:courseId/students/:studentId/final-grade', async (req, res) => {
    const { courseId, studentId } = req.params;

    try {
        // Fetch the student's assignments and exams for the course
        const assignments = await Assignment.findAll({ where: { courseId } });
        const exams = await Exam.findAll({ where: { courseId } });
        const course = await Course.findByPk(courseId);

        let totalGrade = 0;
        let totalWeight = 0;

        // Calculate the weighted grades for assignments and exams
        for (const assignment of assignments) {
            const submission = await AssignmentSubmission.findOne({
                where: { assignmentId: assignment.id, studentId }
            });
            if (submission) {
                totalGrade += submission.pointsEarned * assignment.assignmentWight;
                totalWeight += parseFloat(assignment.assignmentWight);
            }
        }

        for (const exam of exams) {
            const submission = await ExamSubmission.findOne({
                where: { examId: exam.id, studentId }
            });
            if (submission) {
                totalGrade += submission.pointsEarned * exam.examWight;
                totalWeight += parseFloat(exam.examWight);
            }
        }

        // Calculate attendance contribution
        const attendanceRecords = await Attendance.findAll({
            where: { studentId, courseId }
        });
        const attendanceRate = attendanceRecords.filter(record => record.status === 'T').length / attendanceRecords.length;
        const attendanceContribution = attendanceRate * course.attendanceWeight;

        // Final grade is the sum of weighted grades and attendance contribution
        const finalGrade = totalGrade + attendanceContribution * 100;

        // Update the Enrollment table with the final grade
        const enrollment = await Enrollment.findOne({
            where: { studentId, courseId }
        });

        if (enrollment) {
            enrollment.finalGrade = finalGrade.toFixed(2); // Round to 2 decimal places
            await enrollment.save();
        } else {
            return res.status(404).json({ message: 'Enrollment record not found' });
        }

        res.json({
            studentName: (await Student.findByPk(studentId)).firstName + ' ' + (await Student.findByPk(studentId)).lastName,
            finalGrade: finalGrade.toFixed(2) // Round to 2 decimal places
        });
    } catch (error) {
        console.error('Error calculating final grade:', error);
        res.status(500).json({ message: 'Error calculating final grade: ' + error.message });
    }
});


/////////////////////////////////////////////////
//              Simplte Get methods!
/////////////////////////////////////////////////

/*
// API route to get all teachers
app.get('/api/teachers', async (req, res) => {
    try {
        const teachers = await Teacher.findAll();
        res.json(teachers);
    } catch (error) {
        res.status(500).send('Error fetching teachers: ' + error.message);
    }
});
*/
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

/*
// API route to get all exams
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.findAll();
        res.json(students);
    } catch (error) {
        res.status(500).send('Error fetching exams: ' + error.message);
    }
});
*/
// API route to get all exams
app.get('/api/attendance', async (req, res) => {
    try {
        const attendances = await Attendance.findAll();
        res.json(attendances);
    } catch (error) {
        res.status(500).send('Error fetching exams: ' + error.message);
    }
});

// API route to get all exams
app.get('/api/enrollment', async (req, res) => {
    try {
        const enrollment = await Enrollment.findAll();
        res.json(enrollment);
    } catch (error) {
        res.status(500).send('Error fetching exams: ' + error.message);
    }
});

// API route to get all exams
app.get('/api/assignmentSubmission', async (req, res) => {
    try {
        const enrollment = await AssignmentSubmission.findAll();
        res.json(enrollment);
    } catch (error) {
        res.status(500).send('Error fetching exams: ' + error.message);
    }
});

// API route to get all exams
app.get('/api/examSubmission', async (req, res) => {
    try {
        const enrollment = await ExamSubmission.findAll();
        res.json(enrollment);
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

