'use strict';
const nano = require('nanoevents');

class Player {
    constructor(entity) {
        this._entity = entity;
    }

    get entity() {
        return this._entity;
    }

    get account() {
        return this._account;
    }

    set account(account) {
        this._account = account;
    }
    
    hasAccount() {
        return typeof this._account !== 'undefined';
    }

    get character() {
        return this._character;
    }

    set character(character) {
        this._character = character;
    }

    hasCharacter() {
        return typeof this._character !== 'undefined';
    }
}

const emitter = nano.createNanoEvents();

const players = [];

function addPlayer(entity) {
    players.push(new Player(entity));
}

function removePlayer(player) {
    if (typeof player === 'number') {
        const i = players.indexOf(player);
        if (i > -1) {
            players.splice(i, 1);
        }
        console.log(`Removed player ${player}`);
    } else if (typeof player === 'function') {
        const i = players.findIndex(p => player.entity === p.entity);
        if (i > -1) {
            players.splice(i, 1);
        }
        console.log(`Removed player ${player.entity}`);
    }
}

function getPlayer(entity) {
    return players.find(player => player.entity === entity);
}

revmp.on("entityCreated", (entity) => {
    if (revmp.isPlayer(entity)) {
        const name = revmp.getName(entity).name;
        revmp.sendChatMessage(entity, `Welcome to the fox den, ${name}!`, [0, 255, 255]);
        revmp.sendChatMessage(revmp.players, `${name} joined.`);
        addPlayer(entity);
    }
});

revmp.on("entityDestroy", (entity) => {
    if (revmp.isPlayer(entity)) {
        const player = getPlayer(entity);
        emitter.emit('playerDisconnect', player);
        const name = revmp.getName(entity).name;
        revmp.sendChatMessage(revmp.players, `${name} left.`);
        removePlayer(entity);
    }
});

module.exports = {
    getPlayer,
    emitter
};
