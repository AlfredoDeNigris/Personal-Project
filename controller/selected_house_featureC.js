const express = require('express');
const { check, validationResult } = require('express-validator');
const app = express();
const selected_house_featureDb = require("../model/selected_house_featureM.js");
const security = require("./securityC.js");

app.get("/", security.verify, (req, res) => {
    selected_house_featureDb.getSHF(req.pool, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            res.status(200).json(result);
        }
    });
});

app.get("/:client_id/:house_model_id", security.verify,
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
        selected_house_featureDb.getSHFC(req.pool, client_id, house_model_id, (err, result) => {
            if (err) {
                res.status(err.status).send(err);
            } else {
                res.status(200).json(result);
            }
        });
    }
);

app.post('/', security.verify,
    [
        check('client_id').isNumeric().withMessage('Client ID must be a number'),
        check('house_model_id').isNumeric().withMessage('House Model ID must be a number'),
        check('final_price').isNumeric().withMessage('Final Price must be a number'),
        check('feature_id').optional().isNumeric().withMessage('Feature ID must be a number'),
        check('quantity').optional().isNumeric().withMessage('Quantity must be a number')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const selected_house_feature = req.body;
        selected_house_featureDb.create(req.pool, selected_house_feature, (err, result) => {
            if (err) {
                res.status(err.status).send(err);
            } else {
                res.status(200).json(result);
            }
        });
    }
);

app.delete("/:client_id/:house_model_id/:feature_id", security.verify,
    [
        check('client_id').isNumeric().withMessage('Client ID must be a number'),
        check('house_model_id').isNumeric().withMessage('House Model ID must be a number'),
        check('feature_id').isNumeric().withMessage('Feature ID must be a number')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { client_id, house_model_id, feature_id } = req.params;
        selected_house_featureDb.delete(req.pool, client_id, house_model_id, feature_id, (err, result) => {
            if (err) {
                res.status(err.status).send(err);
            } else {
                res.status(200).json(result);
            }
        });
    }
);


module.exports = app;