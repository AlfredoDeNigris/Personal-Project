const request = require('supertest');
const app = require('../index');
const selected_houseDb = require('../model/selected_houseM.js');
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

describe('Selected House Model', () => {
    //getSH
    it('should return 200 and a list of selected houses', async () => {
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

        u.readQuery.mockImplementationOnce((pool, query, params, callback) => {
            callback(null, { result: mockData });
        });

        const response = await request(app)
            .get('/api/selected-house');

        expect(response.statusCode).toBe(200);
        expect(response.body.result).toEqual(mockData);
        expect(u.readQuery).toHaveBeenCalledWith(
            undefined,
            `
        SELECT c.full_name, c.username, c.billing_address, 
        c.phone_number, c.email, hm.review, hm.construction_time, 
        hm.bathroom, hm.bedroom, hm.square_meters, hm.worker_cost, 
        hm.comercial_cost 
        FROM selected_house sh 
        JOIN client c ON sh.client_id = c.client_id 
        JOIN house_model hm ON sh.house_model_id = hm.house_model_id;`,
            null,
            expect.any(Function),
            'selected house'
        );
    });

    it('should return 500 if there is an error', async () => {
        const error = { status: 500, message: 'Database error' };
        u.readQuery.mockImplementation((pool, query, params, callback) => {
            callback(error);
        });

        const response = await request(app)
            .get('/api/selected-house');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    //getSHC
    it('should return 200 and a specific selected_house by client_id', async () => {
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

        u.readQuery.mockImplementationOnce((pool, query, params, callback) => {
            callback(null, { result: mockData });
        });

        const response = await request(app)
            .get('/api/selected-house/1');

        expect(response.statusCode).toBe(200);
        expect(response.body.result).toEqual(mockData);
        expect(u.readQuery).toHaveBeenCalledWith(
            undefined,
            `
        SELECT hm.review, hm.construction_time, hm.bathroom, 
        hm.bedroom, hm.square_meters, hm.comercial_cost 
        FROM house_model hm 
        JOIN selected_house sh ON hm.house_model_id = sh.house_model_id 
        WHERE sh.client_id = ?;`,
            ["1"],
            expect.any(Function),
            'selected house'
        );
    });

    it('should return 400 if client_id is not a number', async () => {
        const response = await request(app)
            .get('/api/selected-house/invalid_id')
            .expect(400);

        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
                msg: 'Client ID must be a number',
                path: 'client_id'
            })
        ]));
    });

    it('should return 500 if there is a database error', async () => {
        const error = { status: 500, message: 'Database error' };

        u.readQuery.mockImplementation((pool, query, params, callback) => {
            callback(error);
        });

        const response = await request(app)
            .get(`/api/selected-house/1`)
            .expect(500);

        expect(response.body).toEqual(error);
    });

    //delete
    it('should delete a selected_house by client_id and house_model_id and return success message', async () => {
        u.executeQuery.mockImplementationOnce((pool, query, params, successMessage, callback) => {
            callback(null, { message: successMessage, detail: { affectedRows: 1 } });
        });

        const response = await request(app).delete('/api/selected-house/2/5');

        expect(response.status).toBe(200);
        expect(u.executeQuery).toHaveBeenCalledWith(
            undefined,
            `
        START TRANSACTION;
        DELETE FROM selected_house_feature WHERE client_id = ? AND house_model_id = ?;
        DELETE FROM selected_house WHERE client_id = ? AND house_model_id = ?;
        COMMIT;`,
            ["2", "5", "2", "5"],
            'Selected house and its features deleted successfully',
            expect.any(Function),
            'selected house'
        );
    });

    it('should return 404 if either client or house_model is not found', async () => {
        const error = {
            status: 404,
            message: 'No registered client found with the entered search criteria'
        };

        u.executeQuery.mockImplementation((pool, query, params, successMessage, callback) => {
            callback(error);
        });

        const response = await request(app)
            .delete(`/api/selected-house/2/5`)
            .send();

        expect(response.status).toBe(404);
        expect(response.body).toEqual(error);
        expect(u.executeQuery).toHaveBeenCalledWith(
            undefined,
            `
        START TRANSACTION;
        DELETE FROM selected_house_feature WHERE client_id = ? AND house_model_id = ?;
        DELETE FROM selected_house WHERE client_id = ? AND house_model_id = ?;
        COMMIT;`,
            ["2", "5", "2", "5"],
            'Selected house and its features deleted successfully',
            expect.any(Function),
            'selected house'
        );
    });

    it('should return 400 if either client_id or house_model_id is not a number', async () => {
        const response = await request(app)
            .delete('/api/selected-house/invalid_id/invalid_id')
            .send();

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
            .delete(`/api/selected-house/2/5`)
            .send();

        expect(response.status).toBe(500);
        expect(response.body).toEqual(error);
    });
});