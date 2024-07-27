const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const config = require('./config.json');

//Read SQL scripts
const sqlSetup = fs.readFileSync('./database/database.sql', 'utf8');
const defaultOptions = fs.readFileSync('./database/defaultOptions.sql', 'utf8');

//Create a connection to the database
const createConnection = () => {
    return mysql.createConnection({
        host: process.env.MYSQL_HOST || 'db',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'personal_project',
        multipleStatements: true,
        port: process.env.MYSQL_PORT || 3306
    });
};


setTimeout(() => {
    connection = createConnection();

    connection.connect(err => {
        if (err) {
            console.error('Error connecting to the database:', err.message);
            return;
        }
        console.log('Connected to the database.');

        //Execute setup script
        connection.query(sqlSetup, (err, results) => {
            if (err) {
                console.error('Error executing the setup SQL script:', err.message);
            } else {
                console.log('Setup SQL script executed successfully.');

                //Execute default options script
                connection.query(defaultOptions, (err, results) => {
                    if (err) {
                        console.error('Error executing the default options SQL script:', err.message);
                    } else {
                        console.log('Default options SQL script executed successfully.');
                    }
                });
            }
        });
    });
}, 2000);


//Default route to check server's status
app.get('/isAlive', (req, res) => {
    res.sendStatus(200);
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
        console.log(`Server is running on port ${config.server.port}.`);
    }
});

//Handle server shutdown
const shutdownConnection = () => {
    console.log('Shutting down database connection');
    connection.end(err => {
        if (err) {
            console.error('Error closing the connection:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
};

//Handle termination signals
process.on('SIGTERM', shutdownConnection);
process.on('SIGINT', shutdownConnection);