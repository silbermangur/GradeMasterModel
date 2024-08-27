const Teacher = require('../models/teacher');
const Course = require('../models/course');
exports.createTeacher = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phoneNumber } = req.body;
        const newTeacher = await Teacher.create({ firstName, lastName, email, password, phoneNumber });
        res.json(newTeacher);
    } catch (error) {
        res.status(500).send('Error creating teacher: ' + error.message);
    }
};

exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.findAll();
        res.json(teachers);
    } catch (error) {
        res.status(500).send('Error fetching teachers: ' + error.message);
    }
};

exports.getAllCoursesOfSpasificTeacher = async (req,res) => {
    try {
        const {teacherId} = req.params;

        // Fetch the courses for the given teacherId
        const courses = await Course.findAll({ where: { teacherId } });

        if (!courses || courses.length === 0) {
            return res.status(404).json({ message: 'No courses found for this teacher.' });
        }

        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses: ' + error.message });
    }
}