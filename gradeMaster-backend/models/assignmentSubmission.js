const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const AssignmentSubmission = sequelize.define('AssignmentSubmission', {
    assignmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    submissionDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    pointsEarned: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    feedback: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

module.exports = AssignmentSubmission;