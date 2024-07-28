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

        } else if (expectedType === 'email') { // email
            const allowedCharacters = /^[A-Za-z0-9._%-ñÑҫÇç]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
            if (!allowedCharacters.test(params[i])) {
                throw errorObject;
            }

        } else if (expectedType !== actualType) {
            throw errorObject;
        }
    }
};


function globalError(callback, err, result, entity, id) {
    console.log("Error:", err);
    if (err) {
        if (err.code === "ER_DUP_ENTRY" && err.sqlMessage.includes('unique_persona')) {
            callback({
                status: 409,
                message: "The selected person already has a user",
                detail: err
            });
        } else if (err.code === "ER_DUP_ENTRY") {
            callback({
                status: 409,
                message: `There is already a registered ${entity} with that ${id}`,
                detail: err
            });
        } else if (err.code === "ER_NO_REFERENCED_ROW_2") {
            callback({
                status: 422,
                message: "The entered dni does not correspond to any person in the database",
                detail: err
            });
        } else if (err.code === "ER_ROW_IS_REFERENCED_2") {
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
            message: `No registered ${entity} found with the entered search criteria`,
            detail: err
        });
    } else {
        callback({
            status: 500,
            message: "Unknown behavior",
            detail: err
        }); // Add error message with code "ER_NO_SUCH_TABLE"
    }
};


function executeQuery(connection, query, params, successMessage, funCallback, entity, id) {
    connection.query(query, params, (err, result) => {
        if (err || result.affectedRows === 0 || result.length === 0) {
            connection.rollback(() => {
                globalError(funCallback, err, result, entity, id);
            });
        } else {
            connection.commit((commitErr) => {
                if (commitErr) {
                    connection.rollback(() => {
                        globalError(funCallback, err, result, entity, id);
                    });
                } else {
                    funCallback(undefined, {
                        message: successMessage,
                        detail: result
                    });
                }
            });
        }
    });
}

/* Función tentativa.
function readQuery(connection, query, params, successMessage, funCallback, entity, id) {
    connection.query(query, params, (err, result) => {
        if (err || result.length === 0) {
            funcionesAuxiliares.globalError(funCallback, err, result, entity, id);
        } else {
            funCallback(undefined, {
                message: successMessage,
                detail: result
            });
        }
    });
}
*/

module.exports = {
    validate: validate,
    globalError: globalError,
    executeQuery: executeQuery
};