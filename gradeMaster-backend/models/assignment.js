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
    assignmentWight: {
        type: DataTypes.DECIMAL(3,2), // 3 total digits, 2 after the decimal point,
        allowNull: false,
        validate: {
            min: 0.00, // minimum value
            max: 1.00  // maximum value
        }
    },
});

module.exports = Assignment;