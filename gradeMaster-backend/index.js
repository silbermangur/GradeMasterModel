// Import necessary modules
const express = require('express');
const dotenv = require('dotenv');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;


// Middleware to parse JSON
app.use(express.json());
app.use(cors());
// Initialize Sequelize with PostgreSQL connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
});

// Authenticate the connection to the database
sequelize.authenticate()
    .then(() => {
        console.log('Connection to the database has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// Define the Teacher model
const Teacher = sequelize.define('Teacher', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Sync the model with the database (creating the table if it doesn't exist)
sequelize.sync()
    .then(() => {
        console.log('Teacher table has been created.');
    })
    .catch(err => {
        console.error('Error creating table:', err);
    });

// API route to create a new teacher
app.post('/api/teachers', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const newTeacher = await Teacher.create({ firstName, lastName, email, password });
        res.json(newTeacher);
    } catch (error) {
        res.status(500).send('Error creating teacher: ' + error.message);
    }
});

// API route to get all teachers
app.get('/api/teachers', async (req, res) => {
    try {
        const teachers = await Teacher.findAll();
        res.json(teachers);
    } catch (error) {
        res.status(500).send('Error fetching teachers: ' + error.message);
    }
});

// Default route to check if the server is running
app.get('/', (req, res) => {
    res.send('GradeMaster Backend is running...');
});

// A simple GET method to check if the API is working
app.get('/api/check', (req, res) => {
    res.json({ message: 'API is working correctly!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

