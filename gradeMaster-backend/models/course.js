const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Attendance = require('./attendance');

const Course = sequelize.define('Course', {
    courseName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    courseCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    attendanceWeight : {
        type: DataTypes.DECIMAL(3,2),
        allowNull: false,
        validate: {
            min: 0.00, // minimum value
            max: 1.00 // maximum value
        }
    },
    teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});


module.exports = Course;
