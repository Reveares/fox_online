'use strict';
const database = require('./database.js');

class Character {
    constructor(id, name, transform) {
        this._id = id;
        this._name = name;
        this._transform = transform;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get transform() {
        return this._transform;
    }
}

async function getCharacters(account) {
    const rows = await database.pool.query('SELECT * FROM `characters` WHERE `account_id` = ?', [account.id]);
    return rows.map(row => new Character(row.id, row.name, { position: [row.pos_x, row.pos_y, row.pos_z], rotation: [row.rot_x, row.rot_y, row.rot_z, row.rot_w] }));
}

async function create(account, name) {
    let conn;
    try {
        conn = await database.pool.getConnection();
        const rows = await conn.query('SELECT * FROM `characters` WHERE `account_id` = ? AND UPPER(`name`) = UPPER(?)', [account.id, name]);
        if (rows.length !== 0) {
            throw Error(`Character '${name}' is already used`);
        }

        const result = await conn.query('INSERT INTO `characters` (`account_id`, `name`, `health`, `max_health`, `pos_x`, `pos_y`, `pos_z`, `rot_x`, `rot_y`, `rot_z`, `rot_w`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [account.id, name, 100, 100, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0]);
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
    const row = rows[0];
    return new Character(row.id, row.name, { position: [row.pos_x, row.pos_y, row.pos_z], rotation: [row.rot_x, row.rot_y, row.rot_z, row.rot_w] });
}

async function savePosition(character, pos) {
    await database.pool.query('UPDATE `characters` SET `pos_x` = ?, `pos_y` = ?, `pos_z` = ? WHERE `id` = ?', [pos[0], pos[1], pos[2], character.id]);
}

async function saveRotation(character, rot) {
    await database.pool.query('UPDATE `characters` SET `rot_x` = ?, `rot_y` = ?, `rot_z` = ?, `rot_w` = ? WHERE `id` = ?', [rot[0], rot[1], rot[2], rot[3], character.id]);
}

module.exports = {
    getCharacters,
    create,
    change,
    savePosition,
    saveRotation
};
