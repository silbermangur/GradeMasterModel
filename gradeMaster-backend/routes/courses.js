const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.post('/', courseController.createCourse);
router.get('/', courseController.getAllCourses);
router.get('/:courseId/enrolled-students',courseController.getAllEnrolledStudents);
router.get('/:courseId/assignments-exams',courseController.getAllAssignmentExams);
router.get('/:courseId/grades',courseController.getAllGradesOfStudent);
router.get('/:courseId/attendance',courseController.getAllattendeanceOfStudentsByCourse);
router.get('/:courseId/students',courseController.getAllStudentsOfCourse);
router.get('/:courseId/students/:studentId/final-grade',courseController.finalGrade);
router.get('/:courseId/report', courseController.generateReport);
router.get('/:courseId/attendance-check', courseController.attendanceCheck);
router.get('/:courseId/attendance-check-exists', courseController.checkAttendanceExists);
router.delete('/:courseId/students/:studentId', courseController.removeStudentFromCourse);
module.exports = router;