function validate(params, expectedTypes) {
    for (let i = 0; i < params.length; i++) {
        const expectedType = expectedTypes[i];
        const actualType = typeof params[i];
        const errorObject = {
            message: `The data type entered at position ${i + 1} is incorrect. Expected: ${expectedType} but received: ${actualType}`,
            code: "INVALID_DATA_TYPE"
        };

        if (expectedType === 'number') { //phone_number, final_price, client_id, house_model_id, feature_id, unit_cost, quantity.
            const inputStr = params[i].toString();
            for (let j = 0; j < inputStr.length; j++) {
                if (isNaN(inputStr[j])) {
                    throw errorObject;
                }
            }
            params[i] = parseInt(params[i]);

        } else if (expectedType === 'string') { //full_name.
            const allowedCharacters = /^[a-zA-ZáÁéÉíÍóÓúÚüÜñÑçÇ\s]+$/;
            if (!allowedCharacters.test(params[i])) {
                throw errorObject;
            }

        } else if (expectedType === 'password') { //password.
            if (actualType !== 'string') {
                throw errorObject;
            }

        } else if (expectedType === 'text') { //username, billing_address, review, information
            if (actualType !== 'string' || params[i] === '') {
                throw errorObject;
            }

        } else if (expectedType === 'email') { //email
            const allowedCharacters = /^[A-Za-z0-9._%-ñÑҫÇç]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
            if (!allowedCharacters.test(params[i])) {
                throw errorObject;
            }

        } else if (expectedType !== actualType) {
            throw errorObject;
        }
    }
};

function globalError(pool, callback, err, result, entity) {
    console.log("Error:", err); // This line is here to help identify unknown errors, will be deleted after app is done
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
    pool.query(query, params, (err, result) => {
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
    validate: validate,
    globalError: globalError,
    executeQuery: executeQuery,
    readQuery: readQuery
};