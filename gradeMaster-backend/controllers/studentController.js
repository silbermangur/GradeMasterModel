const Student = require('../models/student');

exports.createStudent = async (req, res) => {
    try {
        const { firstName, lastName, dateOfBirth, gender, phoneNumber, address, email, enrollmentDate } = req.body;

        // Create a new student
        const newStudent = await Student.create({
            firstName,
            lastName,
            dateOfBirth,
            gender,
            phoneNumber,
            address,
            email,
            enrollmentDate
        });

        res.status(201).json(newStudent);
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ message: 'Error creating student: ' + error.message });
    }
};

exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.findAll();
        res.json(students);
    } catch (error) {
        res.status(500).send('Error fetching students: ' + error.message);
    }
};