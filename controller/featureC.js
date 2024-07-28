const express = require('express');
const app = express();

const featureDb = require("../model/featureM.js");

app.get("/", (req, res) => {
    featureDb.getF(req.pool, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.get("/:difference", (req, res) => {
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