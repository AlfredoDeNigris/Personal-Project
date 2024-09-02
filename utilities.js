function globalError(pool, callback, err, result, entity) {
    if (!pool) {
        callback({
            status: 500,
            message: 'Database pool is not available',
            detail: err
        });
        return;
    }
    if (err) {
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            callback({
                status: 409,
                message: `This ${entity} cannot be deleted due to one or more reference conflicts.`,
                detail: err
            });
        } else if (err.code === "INVALID_DATA_TYPE") {
            callback({
                status: 400,
                message: err.message,
                detail: err
            });
        } else if (err.code === "ER_BAD_FIELD_ERROR") {
            callback({
                status: 400,
                message: "The entered data type is not correct",
                detail: err
            });
        } else {
            callback({
                status: 500,
                message: "Unknown error",
                detail: err
            });
        }
    } else if ((result && result.affectedRows === 0) || (result && result.length === 0)) {
        callback({
            status: 404,
            message: `No registered ${entity} found with the entered search criteria`
        });
    } else {
        callback({
            status: 500,
            message: "Unknown behavior",
            detail: err
        });
    }
}

function executeQuery(pool, query, params, successMessage, callback, entity) {
    pool.getConnection((err, connection) => {
        if (err) {
            return globalError(pool, callback, err, null, entity);
        }

        connection.beginTransaction((transErr) => {
            if (transErr) {
                connection.release();
                return globalError(pool, callback, transErr, null, entity);
            }

            connection.query(query, params, (queryErr, result) => {
                if (queryErr || result.affectedRows === 0 || result.length === 0) {
                    return connection.rollback(() => {
                        connection.release();
                        globalError(pool, callback, queryErr, result, entity);
                    });
                }

                connection.commit((commitErr) => {
                    if (commitErr) {
                        return connection.rollback(() => {
                            connection.release();
                            globalError(pool, callback, commitErr, result, entity);
                        });
                    }

                    connection.release();
                    callback(undefined, {
                        message: successMessage,
                        detail: result
                    });
                });
            });
        });
    });
};

function readQuery(pool, query, params, callback, entity) {
    pool.getConnection(query, params, (err, result) => {
        if (err || result.length === 0) {
            globalError(pool, callback, err, result, entity);
        } else {
            callback(undefined, {
                result
            });
        }
    });
}


module.exports = {
    globalError: globalError,
    executeQuery: executeQuery,
    readQuery: readQuery
};