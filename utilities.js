function validate(params, expectedTypes) { //Ya qyue puedo definir "entity" en cada archivo individual, podria poner a "validate" ú otra función nueva a lidiar con el seteo de "id"
    for (let i = 0; i < params.length; i++) {
        const expectedType = expectedTypes[i];
        const actualType = typeof params[i];
        const errorObject = {
            message: `El tipo de dato ingresado en la posición ${i + 1} es incorrecto. Se esperaba: ${expectedType} pero se recibió: ${actualType}`,
            code: "INVALID_DATA_TYPE"
        };
        // agregar un expectedType === 'array';
        if (expectedType === 'number') {
            const inputStr = params[i].toString();
            for (let j = 0; j < inputStr.length; j++) {
                if (isNaN(inputStr[j])) {
                    throw errorObject;
                }
            }
            params[i] = parseInt(params[i]);

        } else if (expectedType === 'string') { //
            const allowedCharacters = /^[a-zA-ZáÁéÉíÍóÓúÚüÜñÑçÇ\s]+$/;
            if (!allowedCharacters.test(params[i])) {
                throw errorObject;
            }
        } else if (expectedType === 'password') { //password.
            const allowedCharacters = /^[a-zA-Z0-9áÁéÉíÍóÓúÚüÜñÑçÇ\s\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+/;
            if (!allowedCharacters.test(params[i])) {
                throw errorObject;
            }
        } else if (expectedType === 'text') { //
            if ((actualType === 'string') && (params[i] === '')) {
                (expectedType = actualType)
            } else {
                const allowedCharacters = /^[\x20-\x7EáÁéÉíÍóÓúÚüÜñÑçÇ,.;:\-_{}[\]¿?¡#!<>"'| /&%$@`]+$/;
                if (!allowedCharacters.test(params[i])) {
                    throw errorObject;
                }
            }
        } else if (expectedType === 'email') {
            const allowedCharacters = /^[A-Za-z0-9._%-ñÑҫÇç]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
            if (!allowedCharacters.test(params[i])) {
                throw errorObject;
            }
        } else if (expectedType === 'object') {
            const date = new Date(params[i]);
            if (!isNaN(date.getTime())) {
                params[i] = date.toISOString(); //Convierto a Coordinated Universal Time (UTC).
            } else {
                throw errorObject;
            }
        } else if (expectedType !== actualType) {
            throw errorObject;
        }
    }
};

function errorGlobal(callback, err, result, entity, id) {
    console.log("Error:", err);
    if (err) {
        if (err.code === "ER_DUP_ENTRY" && err.sqlMessage.includes('unique_persona')) {
            callback({
                status: 409,
                message: "La persona seleccionada ya dispone de un usuario",
                detail: err
            });
        } else if (err.code === "ER_DUP_ENTRY") {
            callback({
                status: 409,
                message: `Ya hay una ${entity} registrad@ con ese ${id}`,
                detail: err
            });
        } else if (err.code === "ER_NO_REFERENCED_ROW_2") {
            callback({
                status: 422,
                message: "El dni ingresado no corresponde a ninguna persona en la base de datos",
                detail: err
            });
        } else if (err.code === "ER_ROW_IS_REFERENCED_2") {
            callback({
                status: 409,
                message: `No se puede eliminar est@ ${entity}, debido a uno o más conflictos de referencia.`,
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
                message: "El tipo de dato ingresado no es correcto",
                detail: err
            });
        } else {
            callback({
                status: 500,
                message: "Error desconocido",
                detail: err
            });
        }
    } else if ((result && result.affectedRows === 0) || (result && result.length === 0)) {
        callback({
            status: 404,
            message: `No existé ${entity} registrad@ con el criterio de búsqueda ingresado`,
            detail: err
        });
    } else {
        callback({
            status: 500,
            message: "Comportamiento desconocido",
            detail: err
        }); //Agregar mensaje de error con el código "ER_NO_SUCH_TABLE"
    }
};

// Función que ejecuta una query y maneja el resultado
function executeQuery(connection, query, params, successMessage, funCallback, entity, id) {
    connection.query(query, params, (err, result) => {
        if (err || result.affectedRows === 0 || result.length === 0) {
            connection.rollback(() => {
                errorGlobal(funCallback, err, result, entity, id);
            });
        } else {
            connection.commit((commitErr) => {
                if (commitErr) {
                    connection.rollback(() => {
                        errorGlobal(funCallback, err, result, entity, id);
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
            funcionesAuxiliares.errorGlobal(funCallback, err, result, entity, id);
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
    errorGlobal: errorGlobal,
    executeQuery: executeQuery
};