const express = require('express');
const app = express();

const selected_houseDb = require("../model/selected_houseM.js");

app.get("/", (req, res) => {
    selected_houseDb.getSH(req.pool, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.get("/:client_id", (req, res) => {
    const client_id = req.params.client_id;
    selected_houseDb.getSHC(req.pool, client_id, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.post('/', (req, res) => {
    let selected_house = req.body;
    selected_houseDb.create(req.pool, selected_house, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.put("/:client_id/:house_model_id", (req, res) => {//Consultar
    const selected_house_id = req.params.selected_house_id;
    const selected_house = req.body;
    selected_houseDb.update(req.pool, selected_house_id, selected_house, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.delete("/:client_id/:house_model_id", (req, res) => {
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