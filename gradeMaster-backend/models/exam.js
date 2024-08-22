
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
    totalPoints: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});


module.exports = Exam;
