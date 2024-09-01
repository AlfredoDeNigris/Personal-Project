const base64url = require('base64url');
const crypto = require('crypto');

//Custom Error Classes
class JWTError extends Error {
    constructor(message) {
        super(message);
        this.name = "JWTError";
    }
}

class ExpiredTokenError extends JWTError {
    constructor(message) {
        super(message);
        this.name = "ExpiredTokenError";
    }
}

class InvalidTokenError extends JWTError {
    constructor(message) {
        super(message);
        this.name = "InvalidTokenError";
    }
}

//Function to encode data to Base64Url
function encodeBase64Url(data) {
    return base64url(data);
}

//Function to decode data from Base64Url
function decodeBase64Url(data) {
    return base64url.decode(data);
}

//Function to create a signature
function createSignature(header, payload, secret) {
    const data = `${header}.${payload}`;
    return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

//Function to create a JWT
function createJWT(header, payload, secret) {
    try {
        if (!header || !payload || !secret) {
            throw new JWTError("Invalid inputs for JWT creation");
        }

        const encodedHeader = encodeBase64Url(JSON.stringify(header));
        const encodedPayload = encodeBase64Url(JSON.stringify(payload));
        const signature = createSignature(encodedHeader, encodedPayload, secret);
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    } catch (error) {
        console.error(`[JWTError] ${error.message}`);
        throw error;
    }
}

//Function to verify a JWT
function verifyJWT(token, secret) {
    try {
        if (!token || !secret) {
            throw new JWTError("Token and secret are required for verification");
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new InvalidTokenError("Token must have three parts");
        }

        const [header, payload, signature] = parts;
        const validSignature = createSignature(header, payload, secret);

        if (signature !== validSignature) {
            throw new InvalidTokenError("Invalid token signature");
        }

        const decodedPayload = JSON.parse(decodeBase64Url(payload));
        const now = Math.floor(Date.now() / 1000);
        if (decodedPayload.exp && now > decodedPayload.exp) {
            throw new ExpiredTokenError("Token has expired");
        }

        return decodedPayload;
    } catch (error) {
        console.error(`[JWTError] ${error.message}`);
        throw error;
    }
}


module.exports = {
    createJWT,
    verifyJWT,
    JWTError,
    ExpiredTokenError,
    InvalidTokenError
};