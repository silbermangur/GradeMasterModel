const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
    teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});


module.exports = Course;
