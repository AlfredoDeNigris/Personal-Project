const request = require('supertest');
const app = require('../index');
const selected_house_featureDb = require('../model/selected_house_featureM.js');
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

beforeEach(() => {
    u.readQuery.mockClear();
    u.readQuery.mockReset();
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

describe('Selected House Feature Model', () => {
    //getSHF
    it('should return 200 and a list of all selected_house_feature information', async () => {
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
                feature_name: 'Swimming Pool',
                unit_cost: 10000.00,
                information: 'A private pool with all necessary facilities.'
            }
        ];

        u.readQuery.mockImplementationOnce((pool, query, params, callback) => {
            callback(null, { result: mockData });
        });

        const response = await request(app)
            .get('/api/selected-house-feature');

        expect(response.statusCode).toBe(200);
        expect(response.body.result).toEqual(mockData);
        expect(u.readQuery).toHaveBeenCalledWith(
            undefined,
            `
        SELECT c.full_name, c.username, c.billing_address, 
        c.phone_number, c.email, hm.review, hm.construction_time, 
        hm.bathroom, hm.bedroom, hm.square_meters, hm.worker_cost, 
        hm.comercial_cost, f.feature_name, f.unit_cost, f.information 
        FROM selected_house sh 
        JOIN client c ON sh.client_id = c.client_id 
        JOIN house_model hm ON sh.house_model_id = hm.house_model_id 
        JOIN selected_house_feature shf ON sh.client_id = shf.client_id 
        AND sh.house_model_id = shf.house_model_id 
        JOIN feature f ON shf.feature_id = f.feature_id;`,
            null,
            expect.any(Function),
            'selected house feature'
        );
    });

    it('should return 500 if there is an error', async () => {
        const error = { status: 500, message: 'Database error' };
        u.readQuery.mockImplementation((pool, query, params, callback) => {
            callback(error);
        });

        const response = await request(app)
            .get('/api/selected-house-feature');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    it('catch block', () => {
        const error = new Error('Query error');

        u.readQuery.mockImplementationOnce(() => {
            throw error;
        });

        selected_house_featureDb.getSHF(poolMock, callbackMock);

        expect(u.globalError).toHaveBeenCalledWith(
            poolMock,
            callbackMock,
            error,
            null,
            'selected house feature'
        );
    });

    //getSHFC
    it('should return 200 and a specific selected_house_feature by client_id and house_model_id', async () => {
        const mockData = [
            {
                client_id: 1,
                house_model_id: 2,
                feature_name: 'Swimming Pool',
                unit_cost: 10000.00,
                information: 'A private pool with all necessary facilities.'
            }
        ];

        u.readQuery.mockImplementationOnce((pool, query, params, callback) => {
            callback(null, { result: mockData });
        });

        const response = await request(app)
            .get(`/api/selected-house-feature/1/2`);

        expect(response.statusCode).toBe(200);
        expect(response.body.result).toEqual(mockData);
        expect(u.readQuery).toHaveBeenCalledWith(
            undefined,
            `
        SELECT f.feature_name, f.unit_cost, f.information 
        FROM selected_house_feature shf 
        JOIN feature f ON shf.feature_id = f.feature_id 
        WHERE shf.client_id = ? AND shf.house_model_id = ?;`,
            ["1", "2"],
            expect.any(Function),
            'selected house feature'
        );
    });

    it('should return 400 if house_model_id is not a number', async () => {
        const response = await request(app)
            .get('/api/selected-house-feature/1/invalid_house_model_id')
            .expect(400);

        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
                msg: 'House Model ID must be a number',
                path: 'house_model_id'
            })
        ]));
    });

    it('should return 400 if client_id is not a number', async () => {
        const response = await request(app)
            .get('/api/selected-house-feature/client_id/1')
            .expect(400);

        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
                msg: 'Client ID must be a number',
                path: 'client_id'
            })
        ]));
    });

    it('should return 500 if there is an error', async () => {
        const error = { status: 500, message: 'Database error' };
        u.readQuery.mockImplementation((pool, query, params, callback) => {
            callback(error);
        });

        const response = await request(app)
            .get('/api/selected-house-feature/1/2');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    it('catch block', () => {
        const error = new Error('Query error');

        u.readQuery.mockImplementationOnce(() => {
            throw error;
        });

        selected_house_featureDb.getSHFC(poolMock, 1, 2, callbackMock);

        expect(u.globalError).toHaveBeenCalledWith(
            poolMock,
            callbackMock,
            error,
            null,
            'selected house feature'
        );
    });

    //create
    it('should create a new selected house feature', () => {
        const mockData = {
            client_id: 1,
            house_model_id: 2,
            final_price: 300000
        };

        const expectedParams = [
            mockData.client_id,
            mockData.house_model_id,
            mockData.final_price
        ];

        selected_house_featureDb.create(poolMock, mockData, callbackMock);

        expect(u.executeQuery).toHaveBeenCalledWith(
            poolMock,
            `START TRANSACTION;
                     INSERT INTO selected_house (client_id, house_model_id, final_price) 
                     VALUES (?, ?, ?);COMMIT;`,
            expectedParams,
            'New house created successfully',
            callbackMock,
            'selected house feature'
        );
    });

    it('should create a new selected house feature with additional feature details', () => {
        const mockData = {
            client_id: 1,
            house_model_id: 2,
            final_price: 300000,
            feature_id: 3,
            quantity: 5
        };

        const expectedParams = [
            mockData.client_id,
            mockData.house_model_id,
            mockData.final_price,
            mockData.client_id,
            mockData.house_model_id,
            mockData.feature_id,
            mockData.quantity
        ];

        selected_house_featureDb.create(poolMock, mockData, callbackMock);

        expect(u.executeQuery).toHaveBeenCalledWith(
            poolMock,
            `START TRANSACTION;
                     INSERT INTO selected_house (client_id, house_model_id, final_price) 
                     VALUES (?, ?, ?);INSERT INTO selected_house_feature (client_id, house_model_id, feature_id, quantity) 
                      VALUES (?, ?, ?, ?);COMMIT;`,
            expectedParams,
            'New house created successfully',
            callbackMock,
            'selected house feature'
        );
    });

    it('should return validation errors if input data is invalid', async () => {
        const invalidData = {
            client_id: '',
            house_model_id: '',
            final_price: ''
        };

        const response = await request(app)
            .post('/api/selected-house-feature')
            .send(invalidData)
            .expect('Content-Type', /json/)
            .expect(400);

        const { errors } = response.body;

        expect(errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
                msg: 'Client ID must be a number',
                path: 'client_id'
            }),
            expect.objectContaining({
                msg: 'House Model ID must be a number',
                path: 'house_model_id'
            }),
            expect.objectContaining({
                msg: 'Final Price must be a number',
                path: 'final_price'
            }),
        ]));
    });

    it('should handle errors and call globalError if an error occurs', () => {
        const mockData = {
            client_id: 1,
            house_model_id: 2,
            final_price: 300000
        };

        const error = new Error('Something went wrong');
        u.executeQuery.mockImplementationOnce(() => {
            throw error;
        });

        selected_house_featureDb.create(poolMock, mockData, callbackMock);

        expect(u.globalError).toHaveBeenCalledWith(
            poolMock,
            callbackMock,
            error,
            null,
            'selected house feature'
        );
    });

    it('catch block', () => {
        const mockData = {
            client_id: 1,
            house_model_id: 2,
            final_price: 300000
        };

        const error = new Error('Transaction error');

        u.executeQuery.mockImplementationOnce(() => {
            throw error;
        });

        selected_house_featureDb.create(poolMock, mockData, callbackMock);

        expect(u.globalError).toHaveBeenCalledWith(
            poolMock,
            callbackMock,
            error,
            null,
            'selected house feature'
        );
    });

    //delete
    it('should delete a feature associated to a specific selected_house by client_id, house_model_id, and feature_id', async () => {
        const mockData = {
            client_id: "1",
            house_model_id: "2",
            feature_id: "2"
        };

        const expectedParams = [
            mockData.client_id,
            mockData.house_model_id,
            mockData.feature_id
        ];

        u.executeQuery.mockImplementationOnce((pool, query, params, successMessage, callback) => {
            callback(null, { message: successMessage, detail: { affectedRows: 1 } });
        });

        const response = await request(app).delete('/api/selected-house-feature/1/2/2');

        expect(response.status).toBe(200);
        expect(u.executeQuery).toHaveBeenCalledWith(
            undefined,
            'DELETE FROM selected_house_feature WHERE client_id = ? AND house_model_id = ? AND feature_id = ?;',
            expectedParams,
            'Feature deleted successfully',
            expect.any(Function),
            'selected house feature'
        );
    });

    it('should return 404 if the selected house feature is not found', async () => {
        const mockData = {
            client_id: "1",
            house_model_id: "2",
            feature_id: "2"
        };

        const expectedParams = [
            mockData.client_id,
            mockData.house_model_id,
            mockData.feature_id
        ];

        const error = {
            status: 404,
            message: 'No registered selected house feature found with the entered search criteria'
        };

        u.executeQuery.mockImplementation((pool, query, params, successMessage, callback) => {
            callback(error);
        });

        const response = await request(app)
            .delete(`/api/selected-house-feature/1/2/2`)
            .send();

        expect(response.status).toBe(404);
        expect(response.body).toEqual(error);
        expect(u.executeQuery).toHaveBeenCalledWith(
            undefined,
            'DELETE FROM selected_house_feature WHERE client_id = ? AND house_model_id = ? AND feature_id = ?;',
            expectedParams,
            'Feature deleted successfully',
            expect.any(Function),
            'selected house feature'
        );
    });

    it('should return 400 if any id is not a number', async () => {
        const response = await request(app)
            .delete('/api/selected-house-feature/invalid_id/invalid_id/invalid_id')
            .send();

        expect(response.status).toBe(400);
        const { errors } = response.body;

        expect(errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
                msg: 'Client ID must be a number',
                path: 'client_id'
            }),
            expect.objectContaining({
                msg: 'House Model ID must be a number',
                path: 'house_model_id'
            }),
            expect.objectContaining({
                msg: 'Feature ID must be a number',
                path: 'feature_id'
            }),
        ]));
    });

    it('should handle global errors', async () => {
        const error = {
            status: 500,
            message: 'Unknown error'
        };

        u.executeQuery.mockImplementation((pool, query, params, successMessage, callback) => {
            callback(error);
        });

        const response = await request(app)
            .delete(`/api/selected-house-feature/1/2/2`)
            .send();

        expect(response.status).toBe(500);
        expect(response.body).toEqual(error);
    });

    it('catch block', () => {
        const error = new Error('Delete error');

        u.executeQuery.mockImplementationOnce(() => {
            throw error;
        });

        selected_house_featureDb.delete(poolMock, 1, 2, 3, callbackMock);

        expect(u.globalError).toHaveBeenCalledWith(
            poolMock,
            callbackMock,
            error,
            null,
            'selected house feature'
        );
    });
});