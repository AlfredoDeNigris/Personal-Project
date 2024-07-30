const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const config = require('./config.json');

const client = require("./controller/clientC.js");
const feature = require("./controller/featureC.js");
const house_catalogue = require("./controller/house_catalogueC.js");
const selected_house = require("./controller/selected_houseC.js");
const selected_house_feature = require("./controller/selected_house_featureC.js");

//Read SQL scripts
const sqlSetup = fs.readFileSync('./database/database.sql', 'utf8');
const defaultOptions = fs.readFileSync('./database/defaultOptions.sql', 'utf8');

//Create a connection pool to the database
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL_HOST || 'db',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'personal_project',
    multipleStatements: true,
    port: process.env.MYSQL_PORT || 3306
});

// Function to execute SQL scripts
const executeScript = (script, callback) => {
    pool.query(script, (err, results) => {
        if (err) {
            console.error('Error executing SQL script:', err.message);
            callback(err);
        } else {
            console.log('SQL script executed successfully.');
            callback(null, results);
        }
    });
};

// Retry connection logic
const retryConnection = (retries = 5) => {
    pool.getConnection((err, connection) => {
        if (err) {
            if (retries > 0) {
                console.error('Error connecting to the database, retrying...', err.message);
                setTimeout(() => retryConnection(retries - 1), 5000);
            } else {
                console.error('Max retries reached. Could not connect to the database.', err.message);
                process.exit(1);
            }
        } else {
            console.log('Connected to the database.');
            executeScript(sqlSetup, (err) => {
                if (!err) {
                    executeScript(defaultOptions, () => {
                        //Release the initial connection back to the pool
                        connection.release();
                    });
                } else {
                    connection.release();
                }
            });
        }
    });
};

retryConnection();

//Middleware to make the pool available to routes
app.use((req, res, next) => {
    console.log("Setting req.pool");
    req.pool = pool;
    next();
});

//Default route to check server's status
app.get('/api/isAlive', (req, res) => {
    res.sendStatus(200);
});

app.use('/api/client', client);
app.use('/api/features', feature);
app.use('/api/house-catalogue', house_catalogue);
app.use('/api/selected-house', selected_house);
app.use('/api/selected-house-feature', selected_house_feature);

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
    console.log('Shutting down database connections');
    pool.end(err => {
        if (err) {
            console.error('Error closing the connection pool:', err.message);
        } else {
            console.log('Database connection pool closed.');
        }
        process.exit(0);
    });
};

//Handle termination signals
process.on('SIGTERM', shutdownConnection);
process.on('SIGINT', shutdownConnection);