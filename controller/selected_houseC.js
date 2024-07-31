const express = require('express');
const app = express();

const selected_houseDb = require("../model/selected_houseM.js");
const security = require("./securityC.js");

app.get("/", security.verify, (req, res) => {
    selected_houseDb.getSH(req.pool, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.get("/:client_id", security.verify, (req, res) => {
    const client_id = req.params.client_id;
    selected_houseDb.getSHC(req.pool, client_id, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.post('/', security.verify, (req, res) => {
    let selected_house = req.body;
    selected_houseDb.create(req.pool, selected_house, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.delete("/:client_id/:house_model_id", security.verify, (req, res) => {
    const client_id = req.params.client_id;
    const house_model_id = req.params.house_model_id;
    selected_houseDb.delete(req.pool, client_id, house_model_id, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});


module.exports = app;