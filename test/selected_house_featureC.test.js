const request = require('supertest');
const { createApp } = require('../index');

const poolMock = {
    query: jest.fn(),
    getConnection: jest.fn((cb) => cb(null, poolMock)),
    release: jest.fn(),
    beginTransaction: jest.fn((cb) => cb(null)),
    commit: jest.fn((cb) => cb(null)),
    rollback: jest.fn((cb) => cb(null))
};

//Mock the security middleware
jest.mock('../controller/securityC.js', () => ({
    verify: (req, res, next) => next() //ByPass actual token verification
}));

//Mock the database functions
const selected_house_featureDb = require('../model/selected_house_featureM.js');
jest.mock('../model/selected_house_featureM.js', () => ({
    getSHF: jest.fn(),
    getSHFC: jest.fn(),
    create: jest.fn(),
    delete: jest.fn()
}));

describe('Selected House Feature API Endpoints', () => {
    let app;

    beforeAll(() => {
        app = createApp(poolMock);
    });

    //GET /
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
                comercial_cost: 200000.00,
                feature_name: 'Swimming poolMock',
                unit_cost: 10000.00,
                information: 'A private poolMock with all necessary facilities.'
            }
        ];

        selected_house_featureDb.getSHF.mockImplementation((poolMock, callback) => {
            callback(null, mockData);
        });

        const response = await request(app)
            .get('/api/selected-house-feature');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return 500 if there is a database error', async () => {
        const mockError = { status: 500, message: 'Database error' };

        selected_house_featureDb.getSHF.mockImplementation((poolMock, callback) => {
            callback(mockError, null);
        });

        const response = await request(app)
            .get('/api/selected-house-feature');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    //GET /:client_id/:house_model_id
    it('should return 200 and the correct data if the request is successful', async () => {
        const mockData = [
            {
                feature_name: 'poolMock',
                unit_cost: 5000,
                information: 'In-ground poolMock'
            }
        ];

        selected_house_featureDb.getSHFC.mockImplementation((poolMock, client_id, house_model_id, callback) => {
            callback(null, mockData);
        });

        const response = await request(app)
            .get('/api/selected-house-feature/123/456');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return 400 if client_id or house_model_id is not a number', async () => {
        const response = await request(app)
            .get('/api/selected-house-feature/invalid-client-id/456');

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    location: 'params',
                    msg: 'Client ID must be a number',
                    path: 'client_id',
                    type: 'field',
                    value: 'invalid-client-id'
                })
            ])
        );
    });

    it('should return 500 if there is a database error', async () => {
        const mockError = { status: 500, message: 'Database error' };

        selected_house_featureDb.getSHFC.mockImplementation((poolMock, client_id, house_model_id, callback) => {
            callback(mockError, null);
        });

        const response = await request(app)
            .get('/api/selected-house-feature/123/456');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    //POST /
    it('should return 200 and the created house feature if the request is valid', async () => {
        const mockData = { message: 'New house feature created successfully' };

        selected_house_featureDb.create.mockImplementation((poolMock, selected_house_feature, callback) => {
            callback(null, mockData);
        });

        const response = await request(app)
            .post('/api/selected-house-feature')
            .send({
                client_id: 1,
                house_model_id: 2,
                final_price: 300000,
                feature_id: 3,
                quantity: 1
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return 400 if validation fails', async () => {
        const response = await request(app)
            .post('/api/selected-house-feature')
            .send({
                client_id: 'invalid-client-id',
                house_model_id: 'invalid-house-model-id',
                final_price: 'invalid-final-price'
            });

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
                location: 'body',
                msg: 'Client ID must be a number',
                path: 'client_id',
                value: 'invalid-client-id'
            }),
            expect.objectContaining({
                location: 'body',
                msg: 'House Model ID must be a number',
                path: 'house_model_id',
                value: 'invalid-house-model-id'
            }),
            expect.objectContaining({
                location: 'body',
                msg: 'Final Price must be a number',
                path: 'final_price',
                value: 'invalid-final-price'
            })
        ]));
    });

    it('should return 500 if there is a database error', async () => {
        const mockError = { status: 500, message: 'Database error' };

        selected_house_featureDb.create.mockImplementation((poolMock, selected_house_feature, callback) => {
            callback(mockError, null);
        });

        const response = await request(app)
            .post('/api/selected-house-feature')
            .send({
                client_id: 1,
                house_model_id: 2,
                final_price: 300000
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    //DELETE /:client_id/:house_model_id/:feature_id
    it('should return 200 and a success message if the feature is deleted successfully', async () => {
        const mockData = { message: 'Feature deleted successfully' };

        selected_house_featureDb.delete.mockImplementation((poolMock, client_id, house_model_id, feature_id, callback) => {
            callback(null, mockData);
        });

        const response = await request(app)
            .delete('/api/selected-house-feature/1/2/3');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return 400 if validation fails', async () => {
        const response = await request(app)
            .delete('/api/selected-house-feature/invalid-client-id/invalid-house-model-id/invalid-feature-id');

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
                location: 'params',
                msg: 'Client ID must be a number',
                path: 'client_id',
                value: 'invalid-client-id'
            }),
            expect.objectContaining({
                location: 'params',
                msg: 'House Model ID must be a number',
                path: 'house_model_id',
                value: 'invalid-house-model-id'
            }),
            expect.objectContaining({
                location: 'params',
                msg: 'Feature ID must be a number',
                path: 'feature_id',
                value: 'invalid-feature-id'
            })
        ]));
    });

    it('should return 500 if there is a database error', async () => {
        const mockError = { status: 500, message: 'Database error' };

        selected_house_featureDb.delete.mockImplementation((poolMock, client_id, house_model_id, feature_id, callback) => {
            callback(mockError, null);
        });

        const response = await request(app)
            .delete('/api/selected-house-feature/1/2/3');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });
});