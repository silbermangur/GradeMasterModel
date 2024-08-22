const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const ExamSubmission = sequelize.define('ExamSubmission', {
    examId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    pointsEarned: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

module.exports = ExamSubmission