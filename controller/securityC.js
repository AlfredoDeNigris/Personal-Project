const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const { createJWT, verifyJWT, ExpiredTokenError, InvalidTokenError } = require("../tokenGenerator.js");
const u = require("../utilities.js");
const clientDb = require('../model/clientM.js');
const entity = "client";


function login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    clientDb.getCU(req.pool, username, (err, result) => {
        try {
            if (!result || !result.result || result.result.length === 0) {
                return res.status(404).send({
                    message: `No registered client found with the entered search criteria`
                });
            }

            const user = result.result[0];
            const same = bcrypt.compareSync(password, user.password);

            if (same) {
                const userPayload = {
                    username: user.username,
                    full_name: user.full_name,
                    client_id: user.client_id,
                    email: user.email
                };

                const header = { alg: 'HS256', typ: 'JWT' };
                const payload = {
                    ...userPayload,
                    exp: Math.floor(Date.now() / 1000) + (72 * 60 * 60) //Set expiration to 72 hours
                };

                const token = createJWT(header, payload, 'secret');
                res.json({
                    data: userPayload,
                    token: token
                });
            } else {
                res.status(403).send({
                    message: 'Either the username or password is incorrect'
                });
            }
        } catch (err) {
            u.globalError(req.pool, (errorResponse) => res.status(errorResponse.status).json(errorResponse), err, null, entity);
        }
    });
}


function verify(req, res, next) {
    const token = req.headers["token"];

    if (token) {
        try {
            const verifiedPayload = verifyJWT(token, "secret");

            if (verifiedPayload) {
                req.user = verifiedPayload;
                next();
            } else {
                res.status(403).send({
                    message: "Invalid token, permission denied"
                });
            }
        } catch (error) {
            if (error instanceof ExpiredTokenError) {
                res.status(403).send({ message: "Token has expired" });
            } else if (error instanceof InvalidTokenError) {
                res.status(403).send({ message: "Invalid token" });
            } else {
                res.status(403).send({ message: "Access Denied" });
            }
        }
    } else {
        res.status(403).send({
            message: "No authorization token"
        });
    }
};


module.exports = { login, verify };