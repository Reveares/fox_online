'use strict';
const fox = require('./../core/fox.js');
const account = require('./../core/account.js');
const utils = require('./../core/utils.js');

async function processLogin(entity, name, password) {
    const playerAccount = await account.login(name, password);
    revmp.sendChatMessage(entity, `You are logged in as ${playerAccount.name}`);
    const player = fox.getPlayer(entity);
    player.account = playerAccount;
    fox.emitter.emit('accountLogin', player);
}

function extractLoginData(args) {
    if (args.length < 2) {
        throw Error("You need to provide a name and password");
    }
    // TODO: check name and password?

    return [args[0], args[1]];
}

revmp.on("chatCommand", (entity, msg) => {
    const player = fox.getPlayer(entity);
    if (player.hasAccount()) {
        return;
    }

    const [command, args] = utils.extractCommand(msg);
    (async () => {
        try {
            switch (command) {
                case "/register": {
                    const [name, password] = extractLoginData(args);
                    await account.register(name, password);
                    await processLogin(entity, name, password);
                    break;
                }
                case "/login": {
                    const [name, password] = extractLoginData(args);
                    await processLogin(entity, name, password);
                    break;
                }
            }
        } catch (error) {
            console.log(error);
            revmp.sendChatMessage(entity, error.message, [255, 50, 50]);
        }
    })();
});

revmp.on("chatInput", (entity, msg) => {
    const player = fox.getPlayer(entity);
    if (!player.hasCharacter()) {
        return;
    }

    // TODO: this should be in another file
    revmp.sendChatMessage(revmp.players, `${revmp.getName(entity).name}: ${msg}`);
});

revmp.on("entityCreated", (entity) => {
    if (revmp.isPlayer(entity)) {
        revmp.sendChatMessage(entity, `Type '/register (name) (password)' or '/login (name) (password)'`);
        revmp.sendChatMessage(entity, `Other messages will not be sended to other players`);
    }
});
