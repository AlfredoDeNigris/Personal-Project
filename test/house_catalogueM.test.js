const request = require('supertest');
const app = require('../index');
const u = require('../utilities.js');

let poolMock;

jest.mock('../controller/securityC.js', () => ({
    verify: (req, res, next) => next(),
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
        rollback: jest.fn((cb) => cb(null))
    };

    app.use((req, res, next) => {
        req.pool = poolMock;
        next();
    });
});

describe('House Catalogue Model', () => {
    //getHC
    it('should return 200 and a list of housing options', async () => {
        const mockData = [
            {
                review: 'Modern family house with spacious rooms.',
                construction_time: '650',
                bathroom: '2',
                bedroom: '3',
                square_meters: '120',
                worker_cost: '15000.00',
                comercial_cost: '200000.00'
            }
        ];

        u.readQuery.mockImplementationOnce((pool, query, params, callback) => {
            callback(null, { result: mockData });
        });

        const response = await request(app)
            .get('/api/house-catalogue');

        expect(response.statusCode).toBe(200);
        expect(response.body.result).toEqual(mockData);
        expect(u.readQuery).toHaveBeenCalledWith(
            undefined,
            'SELECT review, construction_time, bathroom, bedroom, comercial_cost FROM house_model',
            null,
            expect.any(Function),
            'house model'
        );
    });

    it('should return 500 if there is an error', async () => {
        const error = { status: 500, message: 'Database error' };
        u.readQuery.mockImplementation((pool, query, params, callback) => {
            callback(error);
        });

        const response = await request(app)
            .get('/api/house-catalogue');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    it('catch block', async () => {
        const mockError = new Error('Test error');
        u.readQuery.mockImplementationOnce(() => {
            throw mockError;
        });

        const poolMock = {};
        const callback = jest.fn();

        const house_catalogueDb = require('../model/house_catalogueM.js');
        house_catalogueDb.getHC(poolMock, callback);

        expect(u.globalError).toHaveBeenCalledWith(
            poolMock,
            callback,
            mockError,
            null,
            'house model'
        );
    });

    //getHCB
    it("should return 200 and a list with all housing options information within the inputted budget", async () => {
        const budget = "200000.00";
        const mockData = [
            {
                review: 'Modern family house with spacious rooms.',
                construction_time: '650',
                bathroom: '2',
                bedroom: '3',
                square_meters: '120',
                worker_cost: '15000.00',
                comercial_cost: '200000.00'
            }
        ];

        u.readQuery.mockImplementationOnce((pool, query, params, callback) => {
            callback(null, { result: mockData });
        });

        const response = await request(app)
            .get(`/api/house-catalogue/${budget}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.result).toEqual(mockData);
        expect(u.readQuery).toHaveBeenCalledWith(
            undefined,
            'SELECT review, construction_time, bathroom, bedroom, comercial_cost FROM house_model WHERE comercial_cost <= ?',
            [budget],
            expect.any(Function),
            'house model'
        );
    });

    it('should return 400 if budget is not a number', async () => {
        const response = await request(app)
            .get('/api/house-catalogue/invalid_budget')
            .expect(400);

        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
                msg: 'Budget must be a number',
                path: 'budget'
            })
        ]));
    });

    it('should return 500 if there is a database error', async () => {
        const difference = 200000.00;
        const error = { status: 500, message: 'Database error' };

        u.readQuery.mockImplementation((pool, query, params, callback) => {
            callback(error);
        });

        const response = await request(app)
            .get(`/api/house-catalogue/${difference}`)
            .expect(500);

        expect(response.body).toEqual(error);
    });

    it('catch block', async () => {
        const mockError = new Error('Test error');
        u.readQuery.mockImplementationOnce(() => {
            throw mockError;
        });

        const poolMock = {};
        const budget = 200000;
        const callback = jest.fn();

        const house_catalogueDb = require('../model/house_catalogueM.js');
        house_catalogueDb.getHCB(poolMock, budget, callback);

        expect(u.globalError).toHaveBeenCalledWith(
            poolMock,
            callback,
            mockError,
            null,
            'house model'
        );
    });

    //getHCC
    it("should return 200 and a specific house_model", async () => {
        const house_model_id = "1";
        const mockData = [
            {
                review: 'Modern family house with spacious rooms.',
                construction_time: '650',
                bathroom: '2',
                bedroom: '3',
                square_meters: '120',
                worker_cost: '15000.00',
                comercial_cost: '200000.00'
            }
        ];

        u.readQuery.mockImplementationOnce((pool, query, params, callback) => {
            callback(null, { result: mockData });
        });

        const response = await request(app)
            .get(`/api/house-catalogue//house/${house_model_id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.result).toEqual(mockData);
        expect(u.readQuery).toHaveBeenCalledWith(
            undefined,
            'SELECT review, construction_time, bathroom, bedroom, comercial_cost FROM house_model WHERE house_model_id = ?',
            [house_model_id],
            expect.any(Function),
            'house model'
        );
    });

    it('should return 400 if house_model_id is not a number', async () => {
        const response = await request(app)
            .get('/api/house-catalogue/house/invalid_house_model_id')
            .expect(400);

        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
                msg: 'House model ID must be a number',
                path: 'house_model_id'
            })
        ]));
    });

    it('should return 500 if there is a database error', async () => {
        const house_model_id = 1;
        const error = { status: 500, message: 'Database error' };

        u.readQuery.mockImplementation((pool, query, params, callback) => {
            callback(error);
        });

        const response = await request(app)
            .get(`/api/house-catalogue/house/${house_model_id}`)
            .expect(500);

        expect(response.body).toEqual(error);
    });

    it('catch block', async () => {
        const mockError = new Error('Test error');
        u.readQuery.mockImplementationOnce(() => {
            throw mockError;
        });

        const poolMock = {};
        const house_model_id = 1;
        const callback = jest.fn();

        const house_catalogueDb = require('../model/house_catalogueM.js');
        house_catalogueDb.getHCC(poolMock, house_model_id, callback);

        expect(u.globalError).toHaveBeenCalledWith(
            poolMock,
            callback,
            mockError,
            null,
            'house model'
        );
    });
});