const express = require('express');
const app = express();

const featureDb = require("../model/featureM.js");
const security = require("./securityC.js");

app.get("/", security.verify, (req, res) => {
    featureDb.getF(req.pool, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.get("/:difference", security.verify, (req, res) => {
    const difference = req.params.difference;
    featureDb.getFD(req.pool, difference, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});


module.exports = app;