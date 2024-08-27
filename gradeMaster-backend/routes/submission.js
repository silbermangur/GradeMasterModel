const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

router.post('/assignment', submissionController.createAssignmentSubmission);
router.post('/exam', submissionController.createExamSubmission);
router.get('/assignments', submissionController.getAllAssignmentSubmission);
router.get('/exams', submissionController.getAllExamSubmission);


module.exports = router;