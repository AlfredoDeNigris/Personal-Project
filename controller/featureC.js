const express = require('express');
const { check, validationResult } = require('express-validator');
const app = express();
const featureDb = require("../model/featureM.js");
const security = require("./securityC.js");

app.get("/", security.verify, (req, res) => {
    featureDb.getF(req.pool, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.status(200).json(result);
        }
    });
});

app.get("/:difference", security.verify,
    [
        check('difference').isNumeric().withMessage('Difference must be a number')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const difference = req.params.difference;
        featureDb.getFD(req.pool, difference, (err, result) => {
            if (err) {
                res.status(err.status).send(err);
            } else {
                res.status(200).json(result);
            }
        });
    }
);


module.exports = app;