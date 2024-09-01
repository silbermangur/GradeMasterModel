const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.post('/', studentController.createStudent);
router.get('/', studentController.getAllStudents);

// Get student by ID
router.get('/:studentId', studentController.getStudentById);

// Update student by ID
router.put('/:studentId', studentController.updateStudent);
module.exports = router