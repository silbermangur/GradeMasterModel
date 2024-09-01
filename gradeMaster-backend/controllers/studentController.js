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

exports.getStudentById = async (req,res) => {
    const { studentId } = req.params;
    try {
        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'Error fetching student: ' + error.message });
    }
}

exports.updateStudent = async (req,res) => {
    const { studentId } = req.params;
    const { firstName, lastName, dateOfBirth, gender, phoneNumber, address, email } = req.body;

    try {
        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Update student details
        student.firstName = firstName;
        student.lastName = lastName;
        student.dateOfBirth = dateOfBirth;
        student.gender = gender;
        student.phoneNumber = phoneNumber;
        student.address = address;
        student.email = email;

        // Save the updated student
        await student.save();

        res.json({ message: 'Student updated successfully', student });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Error updating student: ' + error.message });
    }
}