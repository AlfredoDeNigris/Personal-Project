const request = require('supertest');
const { createApp } = require('../index');

//Mock the security middleware
jest.mock('../controller/securityC.js', () => ({
    verify: (req, res, next) => next() //Bypass actual token verification
}));

//Mock the database functions
const selected_houseDb = require('../model/selected_houseM.js');
jest.mock('../model/selected_houseM.js', () => ({
    getSH: jest.fn(),
    getSHC: jest.fn(),
    delete: jest.fn()
}));

poolMock = {
    query: jest.fn(),
    getConnection: jest.fn((cb) => cb(null, poolMock)),
    release: jest.fn(),
    beginTransaction: jest.fn((cb) => cb(null)),
    commit: jest.fn((cb) => cb(null)),
    rollback: jest.fn((cb) => cb(null))
};

describe('Selected House API Endpoints', () => {
    let app;

    beforeAll(async () => {
        //Create the app instance with a mock pool
        app = createApp(poolMock);
    });

    // GET /
    it('should return 200 and the correct data if the request is successful', async () => {
        const mockData = [
            {
                full_name: 'John Doe',
                username: 'johndoe',
                billing_address: '123 Elm St',
                phone_number: '1234567890',
                email: 'john@example.com',
                review: 'Modern family house with spacious rooms.',
                construction_time: 650,
                bathroom: 2,
                bedroom: 3,
                square_meters: 120,
                worker_cost: 15000.00,
                comercial_cost: 200000.00
            }
        ];

        selected_houseDb.getSH.mockImplementation((pool, callback) => {
            callback(null, mockData);
        });

        const response = await request(app)
            .get('/api/selected-house');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return 500 if there is a database error', async () => {
        const mockError = { status: 500, message: 'Database error' };

        selected_houseDb.getSH.mockImplementation((pool, callback) => {
            callback(mockError, null);
        });

        const response = await request(app)
            .get('/api/selected-house');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    // GET /:client_id
    it('should return 200 and the correct data if the request is successful', async () => {
        const mockData = [
            {
                review: 'Modern family house with spacious rooms.',
                construction_time: 650,
                bathroom: 2,
                bedroom: 3,
                square_meters: 120,
                worker_cost: 15000.00,
                comercial_cost: 200000.00
            }
        ];

        selected_houseDb.getSHC.mockImplementation((pool, client_id, callback) => {
            callback(null, mockData);
        });

        const response = await request(app)
            .get('/api/selected-house/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return 400 if the client_id is not a number', async () => {
        const response = await request(app)
            .get('/api/selected-house/invalid-id');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            errors: [
                {
                    msg: 'Client ID must be a number',
                    path: 'client_id',
                    location: 'params',
                    type: 'field',
                    value: 'invalid-id'
                }
            ]
        });
    });

    it('should return 500 if there is a database error', async () => {
        const mockError = { status: 500, message: 'Database error' };

        selected_houseDb.getSHC.mockImplementation((pool, client_id, callback) => {
            callback(mockError, null);
        });

        const response = await request(app)
            .get('/api/selected-house/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    // DELETE /:client_id/:house_model_id
    it('should return 200 and success message if the house and features are deleted successfully', async () => {
        const mockData = { message: 'Selected house and its features deleted successfully' };

        selected_houseDb.delete.mockImplementation((pool, client_id, house_model_id, callback) => {
            callback(null, mockData);
        });

        const response = await request(app)
            .delete('/api/selected-house/1/2');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return 400 if client_id or house_model_id is not a number', async () => {
        const response = await request(app)
            .delete('/api/selected-house/abc/2');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            errors: [
                {
                    msg: 'Client ID must be a number',
                    path: 'client_id',
                    location: 'params',
                    type: 'field',
                    value: 'abc'
                }
            ]
        });
    });

    it('should return 500 if there is a database error', async () => {
        const mockError = { status: 500, message: 'Database error' };

        selected_houseDb.delete.mockImplementation((pool, client_id, house_model_id, callback) => {
            callback(mockError, null);
        });

        const response = await request(app)
            .delete('/api/selected-house/1/2');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });
});