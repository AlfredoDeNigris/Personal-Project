const { createJWT, verifyJWT, JWTError, ExpiredTokenError, InvalidTokenError } = require('../tokenGenerator');

describe("tokenGenerator's Functions", () => {
    const secret = 'supersecret';
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = { sub: '1234567890', name: 'John Doe', iat: Math.floor(Date.now() / 1000) };

    describe('createJWT', () => {
        it('should create a valid JWT', () => {
            const token = createJWT(header, payload, secret);
            expect(token).toBeDefined();
            const parts = token.split('.');
            expect(parts.length).toBe(3);
        });

        it('should throw an error if inputs are invalid', () => {
            expect(() => createJWT(null, payload, secret)).toThrow(JWTError);
            expect(() => createJWT(header, null, secret)).toThrow(JWTError);
            expect(() => createJWT(header, payload, null)).toThrow(JWTError);
        });
    });

    describe('verifyJWT', () => {
        it('should verify a valid JWT and return the payload', () => {
            const token = createJWT(header, payload, secret);
            const decodedPayload = verifyJWT(token, secret);
            expect(decodedPayload).toMatchObject(payload);
        });

        it('should throw an error if token is invalid', () => {
            const token = 'invalid.token.structure';
            expect(() => verifyJWT(token, secret)).toThrow(InvalidTokenError);
        });

        it('should throw an error if signature is invalid', () => {
            const token = createJWT(header, payload, secret);
            const tamperedToken = token.replace(/\w/, 'x'); //Tamper with the token
            expect(() => verifyJWT(tamperedToken, secret)).toThrow(InvalidTokenError);
        });

        it('should throw an error if token is expired', () => {
            const expiredPayload = { ...payload, exp: Math.floor(Date.now() / 1000) - 10 }; //Expired 10 seconds ago
            const token = createJWT(header, expiredPayload, secret);
            expect(() => verifyJWT(token, secret)).toThrow(ExpiredTokenError);
        });

        it('should throw JWTError if token is missing', () => {
            expect(() => verifyJWT(null, secret)).toThrow(JWTError);
            expect(() => verifyJWT('', secret)).toThrow(JWTError);
        });

        it('should throw JWTError if secret is missing', () => {
            const token = createJWT(header, payload, secret);
            expect(() => verifyJWT(token, null)).toThrow(JWTError);
            expect(() => verifyJWT(token, '')).toThrow(JWTError);
        });

        it('should throw InvalidTokenError if token has less than three parts', () => {
            const invalidToken = `${header}.${payload}`; //Token with only two parts
            expect(() => verifyJWT(invalidToken, secret)).toThrow(InvalidTokenError);
        });
    });
});
