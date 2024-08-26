const Enrollment = require('../models/enrollment');

exports.createEnrollment = async (req, res) => {
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
};

exports.getAllEnrolments = async (req,res) => {
    try {
        const enrollment = await Enrollment.findAll();
        res.json(enrollment);
    } catch (error) {
        res.status(500).send('Error fetching exams: ' + error.message);
    }
}


// exports.getEnrollmentsByCourse = async (req, res) => {
//     const { courseId } = req.params;
//     try {
//         const enrollments = await Enrollment.findAll({ where: { courseId } });
//         res.json(enrollments);
//     } catch (error) {
//         res.status(500).send('Error fetching enrollments: ' + error.message);
//     }
// };
