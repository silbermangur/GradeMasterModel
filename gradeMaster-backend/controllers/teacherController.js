const Teacher = require('../models/teacher');

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