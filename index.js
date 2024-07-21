const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const config = require('./config.json');

//Read SQL script
const sqlScript = fs.readFileSync('./database/database.sql', 'utf8');

//Create a connection to the database
const connection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    multipleStatements: true //This allows multiple statements in a single query
});

//Connect to the database and execute the SQL script
connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the database.');

    connection.query(sqlScript, (err, results) => {
        if (err) {
            console.error('Error executing the SQL script:', err.message);
        } else {
            console.log('SQL script executed successfully.');
        }
    });
});

//Middleware to make the connection available to routes
app.use((req, res, next) => {
    req.db = connection;
    next();
});


//Start the Express server
app.listen(config.server.port, (err) => {
    if (err) {
        console.log(err.code);
        console.log(err.fatal);
    } else {
        console.log(`Connected to port ${config.server.port}.`);
    }
});

//Handle server shutdown
const shutdownConnection = () => {
    console.log('Shutting down database connection ');
    connection.end(err => {
        if (err) {
            console.error('Error closing the connection:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
};

// Handle termination signals
process.on('SIGTERM', shutdownConnection);
process.on('SIGINT', shutdownConnection);