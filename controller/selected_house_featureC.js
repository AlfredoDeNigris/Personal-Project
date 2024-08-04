const express = require('express');
const app = express();

const selected_house_featureDb = require("../model/selected_house_featureM.js");
const security = require("./securityC.js");

app.get("/", security.verify, (req, res) => {
    selected_house_featureDb.getSHF(req.pool, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.get("/:client_id/:house_model_id", security.verify, (req, res) => {
    const client_id = req.params.client_id;
    const house_model_id = req.params.house_model_id;
    selected_house_featureDb.getSHFC(req.pool, client_id, house_model_id, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.post('/', security.verify, (req, res) => {
    let selected_house_feature = req.body;
    selected_house_featureDb.create(req.pool, selected_house_feature, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.delete("/:client_id/:house_model_id/:feature_id", security.verify, (req, res) => {
    const client_id = req.params.client_id;
    const house_model_id = req.params.house_model_id;
    const feature_id = req.params.feature_id;
    selected_house_featureDb.delete(req.pool, client_id, house_model_id, feature_id, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});


module.exports = app;