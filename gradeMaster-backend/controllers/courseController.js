const Course = require('../models/course');

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
