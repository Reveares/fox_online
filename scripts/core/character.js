'use strict';
const database = require('./../core/database.js');

class Character {
    constructor(id, name, pos) {
        this._id = id;
        this._name = name;
        this._pos = pos;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get pos() {
        return this._pos;
    }
}

async function getCharacters(account) {
    const rows = await database.pool.query('SELECT * FROM `characters` WHERE `account_id` = ?', [account.id]);
    return rows.map(row => new Character(row.id, row.name, { x: row.pos_x, y: row.pos_y, z: row.pos_z }));
}

async function create(account, name) {
    let conn;
    try {
        conn = await database.pool.getConnection();
        const rows = await conn.query('SELECT * FROM `characters` WHERE `account_id` = ? AND UPPER(`name`) = UPPER(?)', [account.id, name]);
        if (rows.length !== 0) {
            throw Error(`Character '${name}' is already used`);
        }

        const result = await conn.query('INSERT INTO `characters` (`account_id`, `name`, `health`, `max_health`, `pos_x`, `pos_y`, `pos_z`) VALUES (?, ?, ?, ?, ?, ?, ?)', [account.id, name, 100, 100, 0.0, 0.0, 0.0]);
        console.log(result.insertId);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); // release to pool
    }
}

async function change(account, name) {
    const rows = await database.pool.query('SELECT * FROM `characters` WHERE `account_id` = ? AND UPPER(`name`) = UPPER(?)', [account.id, name]);
    if (rows.length === 0) {
        throw Error(`Character '${name}' doesn't exists`);
    }
    return new Character(rows[0].id, rows[0].name, { x: rows[0].pos_x, y: rows[0].pos_y, z: rows[0].pos_z });
}

async function savePosition(character, pos) {
    await database.pool.query('UPDATE `characters` SET `pos_x` = ?, `pos_y` = ?, `pos_z` = ? WHERE `id` = ?', [pos.x, pos.y, pos.z, character.id]);
}

module.exports = {
    getCharacters,
    create,
    change,
    savePosition
};
