const clientDb = {};

const u = require("../utilities.js");
const entity = "client";

//Function to fetch all clients' information
clientDb.getC = (pool, callback) => {
    try {
        const query = 'SELECT full_name, username, password, billing_address, phone_number, email FROM client';

        u.readQuery(pool, query, null, callback, entity);
    } catch (err) {
        u.globalError(pool, callback, err, null, entity);
    }
};

//Function to get a specific client by client_id
clientDb.getCP = (pool, client_id, callback) => {
    try {
        const expectedTypes = ['number'];
        let params = [client_id];
        u.validate(params, expectedTypes);

        const query = 'SELECT full_name, username, password, billing_address, phone_number, email FROM client WHERE client_id = ?';

        u.readQuery(pool, query, params, callback, entity);
    } catch (err) {
        u.globalError(pool, callback, err, null, entity);
    }
};

//Function to create a new client
clientDb.create = (pool, client, callback) => {
    try {
        const expectedTypes = ['string', 'text', 'password', 'text', 'number', 'email'];
        const params = [client.full_name, client.username, client.password, client.billing_address, client.phone_number, client.email];
        u.validate(params, expectedTypes);

        const query = 'INSERT INTO client (full_name, username, password, billing_address, phone_number, email) VALUES (?, ?, ?, ?, ?, ?)';
        let successMessage = `Your registration has been successful.`;

        u.executeQuery(pool, query, params, successMessage, callback, entity);
    } catch (err) {
        u.globalError(pool, callback, err, null, entity);
    }
};

//Function to update a client's information
clientDb.update = (pool, client_id, client, callback) => {
    try {
        const expectedTypes = ['string', 'text', 'password', 'text', 'number', 'email', 'number'];
        const params = [client.full_name, client.username, client.password, client.billing_address, client.phone_number, client.email, client_id];
        u.validate(params, expectedTypes);

        const query = 'UPDATE client SET full_name = ?, username = ?, password = ?, billing_address = ?, phone_number = ?, email = ? WHERE client_id = ?';
        let successMessage = `Profile information updated sucessfully!`;

        u.executeQuery(pool, query, params, successMessage, callback, entity);
    } catch (err) {
        u.globalError(pool, callback, err, null, entity);
    }
};

//Function to delete a client by client_id
clientDb.delete = (pool, client_id, callback) => {
    try {
        const expectedTypes = ['number'];
        let params = [client_id];
        u.validate(params, expectedTypes);

        const query = 'DELETE FROM client WHERE client_id = ?';
        let successMessage = `Client deleted sucessfuly`;

        u.executeQuery(pool, query, params, successMessage, callback, entity);
    } catch (err) {
        u.globalError(pool, callback, err, null, entity);
    }
};

module.exports = clientDb;