const express = require('express');
const router = express.Router();
const assignmentExamController = require('../controllers/assignmentExamController');

router.post('/', assignmentExamController.createAssignmentExam);
router.get('/assignments',assignmentExamController.getAllAssignments )
router.get('/exams',assignmentExamController.getAllAssignments )

module.exports = router;