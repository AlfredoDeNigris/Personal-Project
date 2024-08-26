const selected_house_featureDb = {};

const u = require("../utilities.js");
const entity = "selected house feature";

//Function to fetch all selected_house_feature information
selected_house_featureDb.getSHF = (pool, callback) => {
    try {
        const query = `
        SELECT c.full_name, c.username, c.billing_address, 
        c.phone_number, c.email, hm.review, hm.construction_time, 
        hm.bathroom, hm.bedroom, hm.square_meters, hm.worker_cost, 
        hm.comercial_cost, f.feature_name, f.unit_cost, f.information 
        FROM selected_house sh 
        JOIN client c ON sh.client_id = c.client_id 
        JOIN house_model hm ON sh.house_model_id = hm.house_model_id 
        JOIN selected_house_feature shf ON sh.client_id = shf.client_id 
        AND sh.house_model_id = shf.house_model_id 
        JOIN feature f ON shf.feature_id = f.feature_id;`;

        u.readQuery(pool, query, null, callback, entity);
    } catch (err) {
        u.globalError(pool, callback, err, null, entity);
    }
};

//Function to get a specific selected_house_feature by client_id and house_model_id
selected_house_featureDb.getSHFC = (pool, client_id, house_model_id, callback) => {
    try {
        const query = `
        SELECT f.feature_name, f.unit_cost, f.information 
        FROM selected_house_feature shf 
        JOIN feature f ON shf.feature_id = f.feature_id 
        WHERE shf.client_id = ? AND shf.house_model_id = ?;`;

        u.readQuery(pool, query, [client_id, house_model_id], callback, entity);
    } catch (err) {
        u.globalError(pool, callback, err, null, entity);
    }
};

//Function to create a new selected_house_feature
selected_house_featureDb.create = (pool, selected_house_feature, callback) => {
    try {
        let query = `START TRANSACTION;
                     INSERT INTO selected_house (client_id, house_model_id, final_price) 
                     VALUES (?, ?, ?);`;

        let params = [selected_house_feature.client_id,
        selected_house_feature.house_model_id,
        selected_house_feature.final_price];

        //Conditionally add the query for inserting into selected_house_feature
        if (selected_house_feature.feature_id && selected_house_feature.quantity) {
            query += `INSERT INTO selected_house_feature (client_id, house_model_id, feature_id, quantity) 
                      VALUES (?, ?, ?, ?);`;
            params.push(selected_house_feature.client_id,
                selected_house_feature.house_model_id,
                selected_house_feature.feature_id,
                selected_house_feature.quantity);
        }

        query += `COMMIT;`;
        const successMessage = "New house created successfully";

        u.executeQuery(pool, query, params, successMessage, callback, entity);
    } catch (err) {
        u.globalError(pool, callback, err, null, entity);
    }
};

//Function to delete a feature associated to a specific selected_house by client_id, house_model_id, and feature_id
selected_house_featureDb.delete = (pool, client_id, house_model_id, feature_id, callback) => {
    try {
        const query = 'DELETE FROM selected_house_feature WHERE client_id = ? AND house_model_id = ? AND feature_id = ?;';
        const params = [client_id, house_model_id, feature_id];
        const successMessage = 'Feature deleted successfully';

        u.executeQuery(pool, query, params, successMessage, callback, entity);
    } catch (err) {
        u.globalError(pool, callback, err, null, entity);
    }
};


module.exports = selected_house_featureDb;