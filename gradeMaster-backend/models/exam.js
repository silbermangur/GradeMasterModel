const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exam = sequelize.define('Exam', {
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    examName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    examDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    examWight: {
        type: DataTypes.DECIMAL(3,2), // 3 total digits, 2 after the decimal point,
        allowNull: false,
        validate: {
            min: 0.00, // minimum value
            max: 1.00  // maximum value
        }
    },
});


module.exports = Exam;
