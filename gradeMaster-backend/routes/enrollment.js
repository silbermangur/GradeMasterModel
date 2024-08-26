const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');

router.post('/', enrollmentController.createEnrollment);
// router.get('/course/:courseId', enrollmentController.getEnrollmentsByCourse);
router.get('/',enrollmentController.getAllEnrolments )
module.exports = router;
