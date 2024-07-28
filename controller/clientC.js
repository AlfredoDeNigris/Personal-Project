const express = require('express');
const app = express();

const clientDb = require("../model/clientM.js");

app.get("/", (req, res) => {
    clientDb.getC(req.pool, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.get("/profile/:client_id", (req, res) => {
    const client_id = req.params.client_id;
    clientDb.getCP(req.pool, client_id, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.post('/register', (req, res) => {
    let client = req.body;
    clientDb.create(req.pool, client, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.put("/profile/:client_id", (req, res) => {
    const client_id = req.params.client_id;
    const client = req.body;
    clientDb.update(req.pool, client_id, client, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

app.delete("/profile/:client_id", (req, res) => {
    const client_id = req.params.client_id;
    clientDb.delete(req.pool, client_id, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.json(result);
        }
    });
});

module.exports = app;