const express = require('express');
const app = express();

const house_catalogueDb = require("../model/house_catalogueM.js");
const security = require("./securityC.js");

app.get("/", security.verify, (req, res) => {
    house_catalogueDb.getHC(req.pool, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.get("/:budget", security.verify, (req, res) => {
    const budget = req.params.budget;
    house_catalogueDb.getHCB(req.pool, budget, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.get("/house/:house_model_id", security.verify, (req, res) => {
    const house_model_id = req.params.house_model_id;
    house_catalogueDb.getHCC(req.pool, house_model_id, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});


module.exports = app;