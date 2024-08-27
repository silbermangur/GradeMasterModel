const AssignmentSubmission = require('../models/assignmentSubmission');
const ExamSubmission = require('../models/examSubmission');

exports.createAssignmentSubmission = async (req, res) => {
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
};

exports.createExamSubmission = async (req, res) => {
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
};

exports.getAllExamSubmission = async (req,res) => {
    try {
        const enrollment = await ExamSubmission.findAll();
        res.json(enrollment);
    } catch (error) {
        res.status(500).send('Error fetching exams: ' + error.message);
    }
}

exports.getAllAssignmentSubmission = async (req,res) => {
    try {
        const enrollment = await AssignmentSubmission.findAll();
        res.json(enrollment);
    } catch (error) {
        res.status(500).send('Error fetching exams: ' + error.message);
    }
}