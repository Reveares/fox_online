'use strict';
const fox = require('./../core/fox.js');
const character = require('./../core/character.js');
const utils = require('./../core/utils.js');

function extractName(args) {
    if (args.length < 1) {
        throw Error("You need to provide a name");
    }
    // TODO: check name?

    return args[0];
}

async function savePositionAndRotation(player) {
    try {
        const transform = revmp.getTransform(player.entity);
        const position = [transform.position[0], transform.position[1], transform.position[2]];
        const rotation = [transform.rotation[0], transform.rotation[1], transform.rotation[2], transform.rotation[3]];
        await character.savePosition(player.character, position);
        await character.saveRotation(player.character, rotation);
    } catch (error) {
        console.log(error);
    }
}

async function processCharacterSwitch(player, name) {
    if (player.hasCharacter()) {
        if (player.character.name == name) {
            revmp.sendChatMessage(player.entity, `You already selected character ${name}`);
            return;
        }
        savePositionAndRotation(player);
    }

    player.character = await character.change(player.account, name);
    revmp.sendChatMessage(player.entity, `You selected character ${player.character.name}`);
    revmp.setNameable(player.entity, player.character);
    revmp.setTransform(player.entity, player.character.transform);
    // TODO: set other values.
}

fox.emitter.on('accountLogin', (player) => {
    (async () => {
        try {
            const characters = await character.getCharacters(player.account);
            if (characters.length === 0) {
                revmp.sendChatMessage(player.entity, `Type '/create (name)' to create a new character.`);
            } else {
                revmp.sendChatMessage(player.entity, `Your characters: ${JSON.stringify(characters.map(x => x.name))}`);
                revmp.sendChatMessage(player.entity, `Type '/create (name)' to create a new character or '/switch (name)' to use an existing one.`);
            }
        } catch (error) {
            console.log(error);
            revmp.sendChatMessage(player.entity, error.message, [255, 50, 50]);
        }
    })();
});

fox.emitter.on('playerDisconnect', (player) => {
    (async () => {
        if (player.hasCharacter()) {
            await savePositionAndRotation(player);
        }
    })();
});

revmp.on("chatCommand", (entity, msg) => {
    const player = fox.getPlayer(entity);
    if (!player.hasAccount()) {
        return;
    }

    const [command, args] = utils.extractCommand(msg);
    (async () => {
        try {
            switch (command) {
                case "/create": {
                    if (player.hasCharacter()) {
                        revmp.sendChatMessage(entity, "You can only create a character if you haven't selected one.", [255, 50, 50]);
                        return;
                    }
                    const name = extractName(args);
                    await character.create(player.account, name);
                    await processCharacterSwitch(player, name);
                    break;
                }
                case "/switch": {
                    const name = extractName(args);
                    await processCharacterSwitch(player, name);
                    break;
                }
            }
        } catch (error) {
            console.log(error);
            revmp.sendChatMessage(entity, "There was an error :/", [255, 50, 50]);
        }
    })();
});
