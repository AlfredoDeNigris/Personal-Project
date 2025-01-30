const request = require('supertest');
const { createApp } = require('../index');
const { globalError } = require('../utilities');

describe('globalError Function Tests', () => {
    let app;
    let poolMock;
    let callbackMock;

    beforeEach(() => {
        poolMock = {
            query: jest.fn(),
            getConnection: jest.fn((cb) => cb(null, poolMock)),
            release: jest.fn(),
            beginTransaction: jest.fn((cb) => cb(null)),
            commit: jest.fn((cb) => cb(null)),
            rollback: jest.fn((cb) => cb(null))
        };

        callbackMock = jest.fn();

        app = createApp(poolMock);
    });

    describe('globalError', () => {
        it('should handle missing database pool', () => {
            globalError(null, callbackMock, new Error('Pool is missing'), null, 'testEntity');

            expect(callbackMock).toHaveBeenCalledWith({
                status: 500,
                message: 'Database pool is not available',
                detail: new Error('Pool is missing')
            });
        });

        it('should handle reference conflict error', () => {
            const err = { code: "ER_ROW_IS_REFERENCED_2" };
            globalError(poolMock, callbackMock, err, null, 'testEntity');

            expect(callbackMock).toHaveBeenCalledWith({
                status: 409,
                message: 'This testEntity cannot be deleted due to one or more reference conflicts.',
                detail: err
            });
        });

        it('should handle invalid data type error', () => {
            const err = { code: "INVALID_DATA_TYPE", message: "Invalid data type" };
            globalError(poolMock, callbackMock, err, null, 'testEntity');

            expect(callbackMock).toHaveBeenCalledWith({
                status: 400,
                message: 'Invalid data type',
                detail: err
            });
        });

        it('should handle bad field error', () => {
            const err = { code: "ER_BAD_FIELD_ERROR" };
            globalError(poolMock, callbackMock, err, null, 'testEntity');

            expect(callbackMock).toHaveBeenCalledWith({
                status: 400,
                message: 'The entered data type is not correct',
                detail: err
            });
        });

        it('should handle unknown errors', () => {
            const err = { code: "UNKNOWN_ERROR" };
            globalError(poolMock, callbackMock, err, null, 'testEntity');

            expect(callbackMock).toHaveBeenCalledWith({
                status: 500,
                message: 'Unknown error',
                detail: err
            });
        });

        it('should handle no result found', () => {
            globalError(poolMock, callbackMock, null, { affectedRows: 0 }, 'testEntity');

            expect(callbackMock).toHaveBeenCalledWith({
                status: 404,
                message: 'No registered testEntity found with the entered search criteria'
            });
        });

        it('should handle unknown behavior', () => {
            globalError(poolMock, callbackMock, null, null, 'testEntity');

            expect(callbackMock).toHaveBeenCalledWith({
                status: 500,
                message: 'Unknown behavior',
                detail: null
            });
        });
    });
});