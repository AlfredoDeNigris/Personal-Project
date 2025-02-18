const request = require('supertest');
const { createApp } = require('../index');
const u = require('../utilities.js');

let app;
let poolMock;

jest.mock('../controller/securityC.js', () => ({
    verify: (req, res, next) => next(), //Bypass actual token verification
}));

jest.mock('../utilities.js', () => ({
    globalError: jest.fn(),
    readQuery: jest.fn(),
}));

beforeEach(() => {
    poolMock = {
        query: jest.fn(),
        getConnection: jest.fn((cb) => cb(null, poolMock)),
        release: jest.fn(),
        beginTransaction: jest.fn((cb) => cb(null)),
        commit: jest.fn((cb) => cb(null)),
        rollback: jest.fn((cb) => cb(null)),
    };

    //Mock the database functions to return mock pool
    app = createApp(poolMock);
});

describe('Feature Model', () => {
    //GET /
    it('should return 200 and a list of features', async () => {
        const mockData = [{
            feature_name: 'Swimming Pool',
            unit_cost: '10000.00',
            information: 'A private pool with all necessary facilities.',
        }];

        u.readQuery.mockImplementationOnce((pool, query, params, callback) => {
            callback(null, { result: mockData });
        });

        const response = await request(app).get('/api/features');

        expect(response.statusCode).toBe(200);
        expect(response.body.result).toEqual(mockData);
        expect(u.readQuery).toHaveBeenCalledWith(
            poolMock,
            'SELECT feature_name, unit_cost, information FROM feature',
            null,
            expect.any(Function),
            'feature'
        );
    });

    it('should return 500 if there is an error', async () => {
        const error = { status: 500, message: 'Database error' };
        u.readQuery.mockImplementation((pool, query, params, callback) => callback(error));

        const response = await request(app).get('/api/features');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    //GET /:difference
    it('should return 200 and all features information with a difference between the inputted budget and the selected house_model\'s commercial cost', async () => {
        const difference = '10000.00';
        const mockData = [{
            feature_name: 'Swimming Pool',
            unit_cost: '10000.00',
            information: 'A private pool with all necessary facilities.',
        }];

        u.readQuery.mockImplementationOnce((pool, query, params, callback) => {
            callback(null, { result: mockData });
        });

        const response = await request(app).get(`/api/features/${difference}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.result).toEqual(mockData);
        expect(u.readQuery).toHaveBeenCalledWith(
            poolMock,
            'SELECT feature_name, unit_cost, information FROM feature WHERE unit_cost <= ?',
            [difference],
            expect.any(Function),
            'feature'
        );
    });

    it('should return 400 if difference is not a number', async () => {
        const response = await request(app).get('/api/features/invalid_difference').expect(400);

        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
                msg: 'Difference must be a number',
                path: 'difference',
            }),
        ]));
    });

    it('should return 500 if there is a database error with difference', async () => {
        const difference = 10000.00;
        const error = { status: 500, message: 'Database error' };

        u.readQuery.mockImplementation((pool, query, params, callback) => callback(error));

        const response = await request(app).get(`/api/features/${difference}`).expect(500);

        expect(response.body).toEqual(error);
    });

    it('catch block for getF and getFD', () => {
        const error = new Error('Mocked Error');
        u.readQuery.mockImplementation(() => { throw error; });

        const featureDb = require('../model/featureM');

        featureDb.getF(poolMock, jest.fn());
        expect(u.globalError).toHaveBeenCalledWith(poolMock, expect.any(Function), error, null, 'feature');

        const difference = 10000;
        featureDb.getFD(poolMock, difference, jest.fn());
        expect(u.globalError).toHaveBeenCalledWith(poolMock, expect.any(Function), error, null, 'feature');
    });
});