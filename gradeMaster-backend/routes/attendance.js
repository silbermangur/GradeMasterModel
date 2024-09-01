const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/', attendanceController.createAttendance);
// router.get('/course/:courseId', attendanceController.getAttendanceByCourse);
router.put('/', attendanceController.changeStatus)
router.get('/',attendanceController.getAllattendancy)
router.delete('/:courseId/attendance/:date', attendanceController.removeAttendance)

module.exports = router;