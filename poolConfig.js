const mysql = require('mysql2');

//Function to create and initialize the connection pool
const createPool = () => {
    return mysql.createPool({
        connectionLimit: 10,
        host: process.env.MYSQL_HOST || 'db',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'personal_project',
        multipleStatements: true,
        port: process.env.MYSQL_PORT || 3306
    });
};

//Function to retry connection
const retryConnection = (retries = 5, delay = 5000) => {
    return new Promise((resolve, reject) => {
        const pool = createPool();

        const attemptConnection = () => {
            pool.getConnection((err, connection) => {
                if (err) {
                    if (retries > 0) {
                        console.error(`Error connecting to the database, retrying in ${delay}ms...`, err.message);
                        setTimeout(() => {
                            retryConnection(retries - 1, delay).then(resolve).catch(reject);
                        }, delay);
                    } else {
                        console.error('Max retries reached. Could not connect to the database.', err.message);
                        reject(err);
                    }
                } else {
                    console.log('Connected to the database.');
                    connection.release();
                    resolve(pool);
                }
            });
        };
        attemptConnection();
    });
};

//Function to execute SQL scripts
const executeScript = (pool, script) => {
    return new Promise((resolve, reject) => {
        pool.query(script, (err, results) => {
            if (err) {
                console.error('Error executing SQL script:', err.message);
                reject(err);
            } else {
                console.log('SQL script executed successfully.');
                resolve(results);
            }
        });
    });
};

//Handle server shutdown
const shutdownConnection = (pool) => {
    console.log('Shutting down database connections');
    pool.end(err => {
        if (err) {
            console.error('Error closing the connection pool:', err.message);
        } else {
            console.log('Database connection pool closed.');
        }
        process.exit(0);
    });
};

process.on('SIGTERM', shutdownConnection);
process.on('SIGINT', shutdownConnection);

module.exports = { retryConnection, executeScript, shutdownConnection };