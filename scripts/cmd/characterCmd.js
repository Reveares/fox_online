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

async function savePosition(player) {
    try {
        await character.savePosition(player.character, revmp.getPosition(player.entity));
    } catch (error) {
        console.log(error);
    }
}

async function processCharacterSwitch(player, name) {
    if (player.hasCharacter()) {
        savePosition(player);
    }

    const char = await character.change(player.account, name);
    player.character = char;
    revmp.sendChatMessage(player.entity, `You selected character ${char.name}`);
    revmp.setName(player.entity, char);
    revmp.setPosition(player.entity, char.pos);
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
            revmp.sendChatMessage(entity, error.message, [255, 50, 50]);
        }
    })();
});

fox.emitter.on('playerDisconnect', (player) => {
    (async () => {
        if (player.hasCharacter()) {
            await savePosition(player);
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
            revmp.sendChatMessage(entity, error.message, [255, 50, 50]);
        }
    })();
});
