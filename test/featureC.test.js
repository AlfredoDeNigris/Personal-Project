const request = require('supertest');
const { createApp } = require('../index');
const featureDb = require('../model/featureM.js');
const security = require('../controller/securityC.js');

//Mock the security middleware
jest.mock('../controller/securityC.js', () => ({
    verify: (req, res, next) => next() //Bypass actual token verification
}));

//Mock the database functions
jest.mock('../model/featureM.js', () => ({
    getF: jest.fn(),
    getFD: jest.fn()
}));

//Create an instance of the app with the mock pool
const mockPool = {
    getConnection: jest.fn((callback) => callback(null, {
        query: jest.fn(),
        release: jest.fn()
    }))
};

const app = createApp(mockPool);

describe('Feature API Endpoints', () => {
    //GET /
    it('should return 200 and a list of features', async () => {
        const mockData = [
            { feature_name: 'Feature 1', unit_cost: 100, information: 'Info 1' },
            { feature_name: 'Feature 2', unit_cost: 200, information: 'Info 2' },
        ];

        featureDb.getF.mockImplementation((pool, callback) => {
            callback(null, mockData);
        });

        const response = await request(app)
            .get('/api/features');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return 500 if there is an error in fetching features', async () => {
        featureDb.getF.mockImplementation((pool, callback) => {
            const error = { status: 500, message: 'Database error' };
            callback(error, null);
        });

        const response = await request(app)
            .get('/api/features');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    //GET /:difference
    it('should return 200 and a list of features filtered by unit_cost', async () => {
        const mockDifference = 200;
        const mockData = [
            { feature_name: 'Feature 1', unit_cost: 100, information: 'Info 1' },
            { feature_name: 'Feature 2', unit_cost: 200, information: 'Info 2' },
        ];

        featureDb.getFD.mockImplementation((pool, difference, callback) => {
            callback(null, mockData);
        });

        const response = await request(app)
            .get(`/api/features/${mockDifference}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return 400 if "difference" is not numeric', async () => {
        const response = await request(app)
            .get(`/api/features/not-a-number`);

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    location: 'params',
                    msg: 'Difference must be a number',
                    path: 'difference',
                    type: 'field',
                    value: 'not-a-number'
                })
            ])
        );
    });

    it('should return 500 if there is an error in fetching features by difference', async () => {
        const mockDifference = 200;

        featureDb.getFD.mockImplementation((pool, difference, callback) => {
            const error = { status: 500, message: 'Database error' };
            callback(error, null);
        });

        const response = await request(app)
            .get(`/api/features/${mockDifference}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });
});