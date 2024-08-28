const app = require('../index');
const { globalError } = require('../utilities');

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

    app.use((req, res, next) => {
        req.pool = poolMock;
        next();
    });
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
        globalError({}, callbackMock, err, null, 'testEntity');

        expect(callbackMock).toHaveBeenCalledWith({
            status: 409,
            message: 'This testEntity cannot be deleted due to one or more reference conflicts.',
            detail: err
        });
    });

    it('should handle invalid data type error', () => {
        const err = { code: "INVALID_DATA_TYPE", message: "Invalid data type" };
        globalError({}, callbackMock, err, null, 'testEntity');

        expect(callbackMock).toHaveBeenCalledWith({
            status: 400,
            message: 'Invalid data type',
            detail: err
        });
    });

    it('should handle unknown errors', () => {
        const err = { code: "UNKNOWN_ERROR" };
        globalError({}, callbackMock, err, null, 'testEntity');

        expect(callbackMock).toHaveBeenCalledWith({
            status: 500,
            message: 'Unknown error',
            detail: err
        });
    });

    it('should handle no result found', () => {
        globalError({}, callbackMock, null, { affectedRows: 0 }, 'testEntity');

        expect(callbackMock).toHaveBeenCalledWith({
            status: 404,
            message: 'No registered testEntity found with the entered search criteria'
        });
    });
});

/*
describe('readQuery', () => {
    let mockPool, callbackMock;

    beforeEach(() => {
        mockPool = {
            getConnection: jest.fn()
        };
        callbackMock = jest.fn();
    });

    it('should call globalError on connection error', () => {
        mockPool.getConnection.mockImplementationOnce((query, params, cb) => cb(new Error('Connection error')));

        readQuery(mockPool, 'query', [], callbackMock, 'testEntity');

        expect(globalError).toHaveBeenCalledWith(mockPool, callbackMock, new Error('Connection error'), undefined, 'testEntity');
    });

    it('should call globalError if no result is found', () => {
        mockPool.getConnection.mockImplementationOnce((query, params, cb) => cb(null, []));

        readQuery(mockPool, 'query', [], callbackMock, 'testEntity');

        expect(globalError).toHaveBeenCalledWith(mockPool, callbackMock, undefined, [], 'testEntity');
    });

    it('should return the result on successful query', () => {
        const mockResult = [{ id: 1 }];
        mockPool.getConnection.mockImplementationOnce((query, params, cb) => cb(null, mockResult));

        readQuery(mockPool, 'query', [], callbackMock, 'testEntity');

        expect(callbackMock).toHaveBeenCalledWith(undefined, {
            result: mockResult
        });
    });
});*/