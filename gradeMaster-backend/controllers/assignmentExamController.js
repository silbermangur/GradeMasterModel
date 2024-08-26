const Assignment = require('../models/assignment');
const Exam = require('../models/exam')
const Course = require('../models/course')

exports.createAssignmentExam = async (req,res) => {
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
}

exports.getAllAssignments = async (req,res)  => {
    try {
            const assignments = await Assignment.findAll();
            res.json(assignments);
        } catch (error) {
            res.status(500).send('Error fetching assignments: ' + error.message);
        }
}

exports.getAllExam = async (req,res) => {
    try {
        const exams = await Exam.findAll();
        res.json(exams);
    } catch (error) {
        res.status(500).send('Error fetching exams: ' + error.message);
    }
}

