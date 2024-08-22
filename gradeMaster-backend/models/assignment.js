const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Assignment = sequelize.define('Assignment', {
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    assignmentName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    totalPoints: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

module.exports = Assignment;