const Course = require('../models/course');
const Student = require('../models/student');
const Enrollment = require('../models/enrollment')
const Assignment = require('../models/assignment')
const Attendance = require('../models/attendance')
const Exam = require('../models/exam')
const AssignmentSubmission = require('../models/assignmentSubmission')
const ExamSubmission = require('../models/examSubmission')
const sequelize = require('../config/database');
const PDFDocument = require('pdfkit')
const fs = require('fs');
const path = require('path');

exports.createCourse = async (req, res) => {
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
};

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.findAll();
        res.json(courses);
    } catch (error) {
        res.status(500).send('Error fetching courses: ' + error.message);
    }
};

exports.getAllEnrolledStudents = async (req,res) => {
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
}

exports.getAllAssignmentExams = async (req,res) => {
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
}

exports.getAllGradesOfStudent = async (req,res) => {
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
}
exports.getAllattendeanceOfStudentsByCourse = async (req,res) => {
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
}
exports.getAllAttendanceOfCourse = async (req,res)=> {
    try {
        const courseId = req.params.courseId;

        // Find all lessons associated with the given courseId
        const lessons = await Attendance.findAll({
            where: { courseId: courseId }
        });

        // Extract the dates from the lessons and return them as an array
        const lessonDates = lessons.map(lesson => lesson.date);

        res.json(lessonDates);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).send('Error fetching lessons: ' + error.message);
    }
}
exports.getAllStudentsOfCourse = async (req,res) => {
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
}
exports.finalGrade = async (req,res) => {
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
}
exports.generateReport = async (req, res) => {
    const { courseId  } = req.params;

    try {
        // Fetch the course details
        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Fetch all students enrolled in the course
        const students = await Student.findAll({
            include: {
                model: Enrollment,
                where: { courseId }
            }
        });

        if (!students || students.length === 0) {
            return res.status(404).json({ message: 'No students found for this course.' });
        }

        // Ensure the reports directory exists
        const reportsDir = path.join(__dirname, '../reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir);
        }

        // Create a new PDF document
        const doc = new PDFDocument();
        const filePath = path.join(reportsDir, `course_${courseId}_report.pdf`);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Add some metadata
        doc.info.Title = `Course Report: ${course.courseName}`;
        doc.info.Author = 'GradeMaster';

        // Header
        doc.fontSize(18).text(`Course Report: ${course.courseName}`, { align: 'center' });
        doc.moveDown();

        // Table header
        doc.fontSize(12).text('Student Name', { width: 150, continued: true });
        doc.text('Final Grade', { width: 100, align: 'right' });
        doc.moveDown();

        // Fetch grades and attendance for each student
        for (const student of students) {
            const enrollment = await Enrollment.findOne({ where: { studentId: student.id, courseId } });
            if (!enrollment) continue;

            doc.text(`${student.firstName} ${student.lastName}`, { width: 150, continued: true });
            doc.text(`${enrollment.finalGrade}`, { width: 100, align: 'right' });
            doc.moveDown();
        }

        // Finalize the PDF and end the stream
        doc.end();

       // Wait for the PDF to be fully written before sending the response
       stream.on('finish', () => {
        res.download(filePath, `course_${courseId}_report.pdf`, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).send('Error downloading the file');
            }

            // Optional: delete the file after download
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        });
    });

    stream.on('error', (err) => {
        console.error('Error writing PDF file:', err);
        res.status(500).json({ message: 'Error writing PDF file: ' + err.message });
    });
} catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report: ' + error.message });
}
};
