const request = require('supertest');
const app = require('../index');
const bcrypt = require('bcrypt');
const clientDb = require('../model/clientM.js');
const u = require('../utilities.js');

let poolMock;
let callbackMock;

jest.mock('../controller/securityC.js', () => ({
    verify: (req, res, next) => next(),
}));

jest.mock('../utilities.js', () => ({
    globalError: jest.fn(),
    executeQuery: jest.fn(),
    readQuery: jest.fn(),
}));

jest.mock('bcrypt', () => ({
    hashSync: jest.fn(() => '$2b$10$fixedHashedPassword12345')
}));

beforeEach(() => {
    u.executeQuery.mockClear();
    u.executeQuery.mockReset();

    poolMock = {
        query: jest.fn(),
        getConnection: jest.fn((cb) => cb(null, poolMock)),
        release: jest.fn(),
        beginTransaction: jest.fn((cb) => cb(null)),
        commit: jest.fn((cb) => cb(null)),
        rollback: jest.fn((cb) => cb(null))
    };

    callbackMock = jest.fn();

    app.use((req, res, next) => {
        req.pool = poolMock;
        next();
    });
});


describe('Client Model', () => {
    //getC
    it('should return 200 and a list of clients', async () => {
        const mockData = [
            {
                full_name: 'John Doe',
                username: 'johndoe',
                password: 'hashedpassword',
                billing_address: '123 Main St',
                phone_number: '1234567890',
                email: 'john@example.com'
            }
        ];

        u.readQuery.mockImplementationOnce((pool, query, params, callback) => {
            callback(null, { result: mockData });
        });

        const response = await request(app)
            .get('/api/client');

        expect(response.statusCode).toBe(200);
        expect(response.body.result).toEqual(mockData);
        expect(u.readQuery).toHaveBeenCalledWith(
            undefined,
            'SELECT full_name, username, password, billing_address, phone_number, email FROM client',
            null,
            expect.any(Function),
            'client'
        );
    });

    it('should return 500 if there is an error', async () => {
        const error = { status: 500, message: 'Database error' };
        u.readQuery.mockImplementation((pool, query, params, callback) => {
            callback(error);
        });

        const response = await request(app)
            .get('/api/client');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    it('catch block', () => {
        const error = new Error('Test Error');
        u.readQuery.mockImplementationOnce(() => {
            throw error;
        });

        clientDb.getC(poolMock, callbackMock);

        expect(u.globalError).toHaveBeenCalledWith(
            poolMock,
            callbackMock,
            error,
            null,
            'client'
        );
    });

    //getCP
    it('should return 200 and client profile data when client_id is valid', async () => {
        const mockData = [
            {
                client_id: 1,
                full_name: 'John Doe',
                username: 'johndoe',
                password: 'hashedpassword',
                billing_address: '123 Main St',
                phone_number: '1234567890',
                email: 'john@example.com'
            }
        ];

        u.readQuery.mockImplementationOnce((pool, query, params, callback) => {
            callback(null, { result: mockData });
        });

        const response = await request(app)
            .get('/api/client/profile/1');

        expect(response.statusCode).toBe(200);
        expect(response.body.result).toEqual(mockData);
        expect(u.readQuery).toHaveBeenCalledWith(
            undefined,
            'SELECT full_name, username, password, billing_address, phone_number, email FROM client',
            null,
            expect.any(Function),
            'client'
        );
    });

    it('should return 400 if client_id is not a number', async () => {
        const response = await request(app)
            .get('/api/client/profile/invalid_id')
            .expect(400);

        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
                msg: 'Client ID must be a number',
                path: 'client_id'
            })
        ]));
    });

    it('should return 500 if there is a database error', async () => {
        const client_id = 1;
        const error = { status: 500, message: 'Database error' };

        u.readQuery.mockImplementation((pool, query, params, callback) => {
            callback(error);
        });

        const response = await request(app)
            .get(`/api/client/profile/${client_id}`)
            .expect(500);

        expect(response.body).toEqual(error);
    });

    it('catch block', () => {
        const error = new Error('Test Error');
        u.readQuery.mockImplementationOnce(() => {
            throw error;
        });

        clientDb.getCP(poolMock, 1, callbackMock);

        expect(u.globalError).toHaveBeenCalledWith(
            poolMock,
            callbackMock,
            error,
            null,
            'client'
        );
    });

    //create
    it('should hash the password and execute the query with the correct parameters', () => {
        const client = {
            full_name: 'John Doe',
            username: 'johndoe',
            password: 'password123',
            billing_address: '123 Main St',
            phone_number: '1234567890',
            email: 'john.doe@example.com'
        };

        const expectedParams = [
            client.full_name,
            client.username,
            '$2b$10$fixedHashedPassword12345',
            client.billing_address,
            client.phone_number,
            client.email
        ];

        clientDb.create(poolMock, client, callbackMock);

        expect(u.executeQuery).toHaveBeenCalledWith(
            poolMock,
            'INSERT INTO client (full_name, username, password, billing_address, phone_number, email) VALUES (?, ?, ?, ?, ?, ?)',
            expectedParams,
            'Your registration has been successful.',
            callbackMock,
            'client'
        );
    });

    it('should return validation errors if input data is invalid', async () => {
        const invalidClientData = {
            full_name: '',
            username: '',
            password: '',
            billing_address: '',
            phone_number: '',
            email: ''
        };

        const response = await request(app)
            .post('/api/client/register')
            .send(invalidClientData)
            .expect('Content-Type', /json/)
            .expect(400);

        const { errors } = response.body;

        expect(errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
                msg: 'Full name contains invalid characters.',
                path: 'full_name'
            }),
            expect.objectContaining({
                msg: 'Username is required',
                path: 'username'
            }),
            expect.objectContaining({
                msg: 'Password is required',
                path: 'password'
            }),
            expect.objectContaining({
                msg: 'Billing address is required',
                path: 'billing_address'
            }),
            expect.objectContaining({
                msg: 'Phone number must be numeric',
                path: 'phone_number'
            }),
            expect.objectContaining({
                msg: 'Invalid email address',
                path: 'email'
            }),
        ]));
    });

    it('should handle errors and call globalError if an error occurs', () => {
        const client = {
            full_name: 'John Doe',
            username: 'johndoe',
            password: 'password123',
            billing_address: '123 Main St',
            phone_number: '1234567890',
            email: 'john.doe@example.com'
        };

        const error = new Error('Something went wrong');
        u.executeQuery.mockImplementationOnce(() => {
            throw error;
        });

        clientDb.create(poolMock, client, callbackMock);

        expect(u.globalError).toHaveBeenCalledWith(
            poolMock,
            callbackMock,
            error,
            null,
            'client'
        );
    });

    it('catch block', () => {
        const error = new Error('Test Error');
        u.readQuery.mockImplementationOnce(() => {
            throw error;
        });

        clientDb.getCU(poolMock, 'johndoe', callbackMock);

        expect(u.globalError).toHaveBeenCalledWith(
            poolMock,
            callbackMock,
            error,
            null,
            'client'
        );
    });

    //update
    it('should hash the password, execute the query with the correct parameters, and commit the transaction', () => {
        const client_id = 1;
        const client = {
            full_name: 'John Doe',
            username: 'johndoe',
            password: 'password123',
            billing_address: '123 Main St',
            phone_number: '1234567890',
            email: 'john.doe@example.com',
        };

        const expectedParams = [
            client.full_name,
            client.username,
            '$2b$10$fixedHashedPassword12345',
            client.billing_address,
            client.phone_number,
            client.email,
            client_id,
        ];

        clientDb.update(poolMock, client_id, client, callbackMock);

        expect(bcrypt.hashSync).toHaveBeenCalledWith(client.password, 10);
        expect(u.executeQuery).toHaveBeenCalledWith(
            poolMock,
            'UPDATE client SET full_name = ?, username = ?, password = ?, billing_address = ?, phone_number = ?, email = ? WHERE client_id = ?',
            expectedParams,
            'Profile information updated successfully!',
            callbackMock,
            'client'
        );
    });

    it('should call globalError if an error occurs during the query execution', () => {
        const client_id = 1;
        const client = {
            full_name: 'John Doe',
            username: 'johndoe',
            password: 'password123',
            billing_address: '123 Main St',
            phone_number: '1234567890',
            email: 'john.doe@example.com',
        };

        const mockError = new Error('Test Error');
        u.executeQuery.mockImplementationOnce((pool, query, params, successMessage, callback) => {
            throw mockError;
        });

        clientDb.update(poolMock, client_id, client, callbackMock);

        expect(u.globalError).toHaveBeenCalledWith(poolMock, callbackMock, mockError, null, 'client');
    });

    it('catch block', () => {
        const error = new Error('Test Error');
        u.executeQuery.mockImplementationOnce(() => {
            throw error;
        });

        const client = {
            full_name: 'John Doe',
            username: 'johndoe',
            password: 'password123',
            billing_address: '123 Main St',
            phone_number: '1234567890',
            email: 'john.doe@example.com'
        };

        clientDb.update(poolMock, 1, client, callbackMock);

        expect(u.globalError).toHaveBeenCalledWith(
            poolMock,
            callbackMock,
            error,
            null,
            'client'
        );
    });

    //delete
    it('should delete a client and return success message', async () => {
        u.executeQuery.mockImplementationOnce((pool, query, params, successMessage, callback) => {
            callback(null, { message: successMessage, detail: { affectedRows: 1 } });
        });

        const response = await request(app).delete('/api/client/profile/1');

        expect(response.status).toBe(200);
        expect(u.executeQuery).toHaveBeenCalledWith(
            undefined,
            'DELETE FROM client WHERE client_id = ?',
            ["1"],
            'Client deleted successfully',
            expect.any(Function),
            'client'
        );
    });

    it('should return 404 if client is not found', async () => {
        const client_id = 1;
        const error = {
            status: 404,
            message: 'No registered client found with the entered search criteria'
        };

        u.executeQuery.mockImplementation((pool, query, params, successMessage, callback) => {
            callback(error);
        });

        const response = await request(app)
            .delete(`/api/client/profile/${client_id}`)
            .send();

        expect(response.status).toBe(404);
        expect(response.body).toEqual(error);
        expect(u.executeQuery).toHaveBeenCalledWith(
            undefined,
            'DELETE FROM client WHERE client_id = ?',
            ["1"],
            'Client deleted successfully',
            expect.any(Function),
            'client'
        );
    });

    it('should return 400 if client_id is not a number', async () => {
        const response = await request(app)
            .delete('/api/client/profile/invalid_id')
            .send();

        expect(response.status).toBe(400);
        expect(response.body.errors[0].msg).toBe('Client ID must be a number');
    });

    it('catch block', () => {
        const error = new Error('Test Error');
        u.executeQuery.mockImplementationOnce(() => {
            throw error;
        });

        clientDb.delete(poolMock, 1, callbackMock);

        expect(u.globalError).toHaveBeenCalledWith(
            poolMock,
            callbackMock,
            error,
            null,
            'client'
        );
    });
});