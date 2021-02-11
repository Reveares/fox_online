'use strict';
const database = require('./../core/database.js');
const crypto = require('crypto');

class Account {
    constructor(id, name) {
        this._id = id;
        this._name = name;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }
}

async function register(name, password) {
    let conn;
    try {
        conn = await database.pool.getConnection();
        const rows = await conn.query('SELECT * FROM `accounts` WHERE UPPER(`name`) = UPPER(?)', [name]);
        if (rows.length !== 0) {
            throw Error(`Account ${name} is already used`);
        }

        const hash = crypto.createHash('sha512');
        hash.update(password);
        const result = await conn.query('INSERT INTO `accounts` (`name`, `password`) VALUES (?, ?)', [name, hash.digest('hex')]);
        console.log(result.insertId);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function login(name, password) {
    const hash = crypto.createHash('sha512');
    hash.update(password);
    const rows = await database.pool.query('SELECT * FROM `accounts` WHERE UPPER(`name`) = UPPER(?) AND `password` = ?', [name, hash.digest('hex')]);
    if (rows.length === 0) {
        throw Error(`Account ${name} doesn't exists or password is wrong`);
    }
    return new Account(rows[0].id, rows[0].name);
}

module.exports = {
    register,
    login
};
