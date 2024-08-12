const express = require('express');
const { check, validationResult } = require('express-validator');
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

app.get("/:client_id", security.verify,
    [
        check('client_id').isNumeric().withMessage('Client ID must be a number')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const client_id = req.params.client_id;
        selected_houseDb.getSHC(req.pool, client_id, (err, result) => {
            if (err) {
                res.status(err.status).send(err);
            } else {
                res.json(result);
            }
        });
    }
);

app.delete("/:client_id/:house_model_id", security.verify,
    [
        check('client_id').isNumeric().withMessage('Client ID must be a number'),
        check('house_model_id').isNumeric().withMessage('House Model ID must be a number')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { client_id, house_model_id } = req.params;
        selected_houseDb.delete(req.pool, client_id, house_model_id, (err, result) => {
            if (err) {
                res.status(err.status).send(err);
            } else {
                res.json(result);
            }
        });
    }
);


module.exports = app;