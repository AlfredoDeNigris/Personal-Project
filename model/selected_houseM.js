const selected_houseDb = {};

const u = require("../utilities.js");
const entity = "selected house";

//Function to fetch all selected_house information
selected_houseDb.getSH = (pool, callback) => {
    try {
        const query = `
        SELECT c.full_name, c.username, c.billing_address, 
        c.phone_number, c.email, hm.review, hm.construction_time, 
        hm.bathroom, hm.bedroom, hm.square_meters, hm.worker_cost, 
        hm.comercial_cost 
        FROM selected_house sh 
        JOIN client c ON sh.client_id = c.client_id 
        JOIN house_model hm ON sh.house_model_id = hm.house_model_id;`;

        u.readQuery(pool, query, null, callback, entity);
    } catch (err) {
        u.globalError(pool, callback, err, null, entity);
    }
};

//Function to get a specific selected_house by client_id
selected_houseDb.getSHC = (pool, client_id, callback) => {
    try {
        const query = `
        SELECT hm.review, hm.construction_time, hm.bathroom, 
        hm.bedroom, hm.square_meters, hm.comercial_cost 
        FROM house_model hm 
        JOIN selected_house sh ON hm.house_model_id = sh.house_model_id 
        WHERE sh.client_id = ?;`;

        u.readQuery(pool, query, [client_id], callback, entity);
    } catch (err) {
        u.globalError(pool, callback, err, null, entity);
    }
};

//Function to delete a selected_house by client_id and house_model_id
selected_houseDb.delete = (pool, client_id, house_model_id, callback) => {
    try {
        const query = `
        START TRANSACTION;
        DELETE FROM selected_house_feature WHERE client_id = ? AND house_model_id = ?;
        DELETE FROM selected_house WHERE client_id = ? AND house_model_id = ?;
        COMMIT;`;
        const params = [client_id, house_model_id, client_id, house_model_id];
        const successMessage = "Selected house and its features deleted successfully";

        u.executeQuery(pool, query, params, successMessage, callback, entity);
    } catch (err) {
        u.globalError(pool, callback, err, null, entity);
    }
};


module.exports = selected_houseDb;