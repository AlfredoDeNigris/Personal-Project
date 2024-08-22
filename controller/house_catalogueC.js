const express = require('express');
const { check, validationResult } = require('express-validator');
const app = express();
const house_catalogueDb = require("../model/house_catalogueM.js");
const security = require("./securityC.js");

app.get("/", security.verify, (req, res) => {
    house_catalogueDb.getHC(req.pool, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.status(200).json(result);
        }
    });
});

app.get("/:budget", security.verify,
    [
        check('budget').isNumeric().withMessage('Budget must be a number')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const budget = req.params.budget;
        house_catalogueDb.getHCB(req.pool, budget, (err, result) => {
            if (err) {
                res.status(err.status).send(err);
            } else {
                res.status(200).json(result);
            }
        });
    }
);

app.get("/house/:house_model_id", security.verify,
    [
        check('house_model_id').isNumeric().withMessage('House model ID must be a number')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const house_model_id = req.params.house_model_id;
        house_catalogueDb.getHCC(req.pool, house_model_id, (err, result) => {
            if (err) {
                res.status(err.status).send(err);
            } else {
                res.status(200).json(result);
            }
        });
    }
);


module.exports = app;