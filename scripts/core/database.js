'use strict';
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    database: 'fox',
    connectionLimit: 5
});

revmp.on('shutdown', () => {
    pool.end()
        .then(() => {
            console.log('Closed database connections.');
        })
        .catch(error => {
            console.log(error);
        });
});

module.exports = {
    pool
};
