const Attendance = require('../models/attendance');

exports.createAttendance = async (req, res) => {
    const { studentId, courseId, date, status } = req.body;
    try {
        const [attendance, created] = await Attendance.findOrCreate({
            where: { studentId, courseId, date },
            defaults: { status }
        });

        if (!created) {
            attendance.status = status;
            await attendance.save();
        }

        res.status(200).json(attendance);
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ message: 'Error updating attendance: ' + error.message });
    }
};
/*
exports.getAttendanceByCourse = async (req, res) => {
    const { courseId } = req.params;
    try {
        const attendanceRecords = await Attendance.findAll({ where: { courseId } });
        res.json(attendanceRecords);
    } catch (error) {
        res.status(500).send('Error fetching attendance: ' + error.message);
    }
};
*/
exports.getAllattendancy = async (req,res) => {
    try {
        const attendances = await Attendance.findAll();
                res.json(attendances);
        } catch (error) {
                res.status(500).send('Error fetching exams: ' + error.message);
        }
}


exports.changeStatus = async (req, res) => {
    const { studentId, courseId, status } = req.body;
    try {
        // Find the existing attendance record
        const attendance = await Attendance.findOne({
            where: { studentId, courseId }
        });

        if (attendance) {
            // Update the status
            attendance.status = status;
            await attendance.save();
            res.status(200).json(attendance);
        } else {
            res.status(404).json({ message: 'Attendance record not found' });
        }
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ message: 'Error updating attendance: ' + error.message });
    }
}

exports.removeAttendance = async (req,res) => {
    const { courseId, date } = req.params;

    try {
        // Delete attendance records for the specified course and date
        await Attendance.destroy({
            where: {
                courseId,
                date
            }
        });

        res.json({ message: 'Attendance removed successfully' });
    } catch (error) {
        console.error('Error removing attendance:', error);
        res.status(500).json({ message: 'Error removing attendance: ' + error.message });
    }
}