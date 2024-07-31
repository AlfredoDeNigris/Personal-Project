const securityDb = {};
const bcrypt = require('bcrypt');

const u = require("../utilities.js");
const entity = "client";



function login(req, res) {
    const { dni, password } = req.body;

    if (!dni) {
        return res.status(400).send({ message: 'Deberias proporcionar un DNI' });
    }

    if (!password) {
        return res.status(400).send({ message: 'Deberias proporcionar la contraseña' });
    }

    usuarioDb.getByDNI(dni, (err, result) => {
        if (err) {
            res.status(err.status).send(err);
        } else {
            const same = bcrypt.compareSync(password, result.detail.password);
            if (same) {
                let user = {
                    dni: result.detail.dni,
                    nombre: result.detail.name,
                    user_id: result.detail.user_id,
                    email: result.detail.email,
                    rol: result.detail.role_id
                };

                // Create the JWT header and payload
                const header = { alg: 'HS256', typ: 'JWT' };
                const payload = {
                    ...user,
                    exp: Math.floor(Date.now() / 1000) + (72 * 60 * 60) //Set expiration to 72 hours
                };

                try {
                    //Generate the JWT token using the custom implementation
                    const token = createJWT(header, payload, 'siliconSecret');
                    res.json({
                        datos: user,
                        token: token
                    });
                } catch (error) {
                    res.status(500).send({ message: 'Error generating token' });
                }
            } else {
                res.status(403).send({
                    message: 'Contraseña Incorrecta'
                });
            }
        }
    });
}




function verify(req, res, next) {
    if (req.headers["token"]) {
        try {
            const token = req.headers["token"];
            //Verify the token using the custom implementation
            const verifiedPayload = verifyJWT(token, "siliconSecret");

            if (verifiedPayload) {
                req.user = verifiedPayload; //Attach the payload to the request object
                next();
            } else {
                res.status(403).send({
                    message: "Token invalido, permiso denegado"
                });
            }
        } catch (error) {
            if (error instanceof ExpiredTokenError) {
                res.status(403).send({ message: "Token ha expirado" });
            } else if (error instanceof InvalidTokenError) {
                res.status(403).send({ message: "Token inválido" });
            } else {
                res.status(403).send({ message: "Acceso Denegado" });
            }
        }
    } else {
        res.status(403).send({
            message: "No posee token de autorización"
        });
    }
}
