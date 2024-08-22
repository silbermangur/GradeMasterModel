const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    enrollmentDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    finalGrade: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
});

module.exports = Enrollment;
