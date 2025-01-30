const express = require('express');
const cors = require('cors');
const fs = require('fs');
const config = require('./config.json');
const { retryConnection, executeScript, shutdownConnection } = require('./poolConfig.js');

const createApp = (pool) => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    //Middleware to make the pool available to routes
    app.use((req, res, next) => {
        req.pool = pool;
        next();
    });

    //Declare routes
    const client = require("./controller/clientC.js");
    const feature = require("./controller/featureC.js");
    const house_catalogue = require("./controller/house_catalogueC.js");
    const selected_house = require("./controller/selected_houseC.js");
    const selected_house_feature = require("./controller/selected_house_featureC.js");

    //Set up routes
    app.use('/api/client', client);
    app.use('/api/features', feature);
    app.use('/api/house-catalogue', house_catalogue);
    app.use('/api/selected-house', selected_house);
    app.use('/api/selected-house-feature', selected_house_feature);

    app.get('/api/isAlive', (req, res) => {
        res.sendStatus(200);
    });

    return app;
};

const startServer = async () => {
    try {
        const pool = await retryConnection();
        const app = createApp(pool);

        //Read SQL scripts
        const sqlSetup = fs.readFileSync('./database/database.sql', 'utf8');
        const defaultOptions = fs.readFileSync('./database/defaultOptions.sql', 'utf8');

        //Execute initial SQL scripts
        await executeScript(pool, sqlSetup);
        await executeScript(pool, defaultOptions);

        //Set up login route
        const { login } = require('./controller/securityC.js');
        app.post('/api/login', login);

        //Start the Express server
        app.listen(config.server.port, () => {
            console.log(`Server is running on port ${config.server.port}.`);
        });

        //Handle termination signals
        process.on('SIGTERM', () => shutdownConnection(pool));
        process.on('SIGINT', () => shutdownConnection(pool));
    } catch (err) {
        console.error('Failed to connect to the database:', err.message);
        process.exit(1);
    }
};

startServer();


module.exports = { createApp };