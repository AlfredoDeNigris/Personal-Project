const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const config = require('./config.json');
const { retryConnection, executeScript, shutdownConnection } = require('./poolConfig.js');

//Read SQL scripts
const sqlSetup = fs.readFileSync('./database/database.sql', 'utf8');
const defaultOptions = fs.readFileSync('./database/defaultOptions.sql', 'utf8');

//Declaration
const client = require("./controller/clientC.js");
const feature = require("./controller/featureC.js");
const house_catalogue = require("./controller/house_catalogueC.js");
const { login } = require('./controller/securityC.js');
const selected_house = require("./controller/selected_houseC.js");
const selected_house_feature = require("./controller/selected_house_featureC.js");

//Routes
app.use('/api/client', client);
app.use('/api/features', feature);
app.use('/api/house-catalogue', house_catalogue);
app.use('/api/selected-house', selected_house);
app.use('/api/selected-house-feature', selected_house_feature);

//Default route to check server's status
app.get('/api/isAlive', (req, res) => {
    res.sendStatus(200);
});

//Retry connection and start server
retryConnection()
    .then(pool => {
        //Middleware to make the pool available to routes
        app.use((req, res, next) => {
            req.pool = pool;
            next();
        });

        //Execute initial SQL scripts
        executeScript(pool, sqlSetup)
            .then(() => executeScript(pool, defaultOptions))
            .catch(err => console.error('Failed to execute SQL scripts:', err.message));

        app.post('/api/login', login);

        //Start the Express server
        app.listen(config.server.port, (err) => {
            if (err) {
                console.log(err.code);
                console.log(err.fatal);
            } else {
                console.log(`Server is running on port ${config.server.port}.`);
            }
        });

        //Handle termination signals
        process.on('SIGTERM', () => shutdownConnection(pool));
        process.on('SIGINT', () => shutdownConnection(pool));
    })
    .catch(err => {
        console.error('Failed to connect to the database:', err.message);
        process.exit(1);
    });

module.exports = app;