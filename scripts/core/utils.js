'use strict';

function extractCommand(msg) {
    const args = msg.split(' ');
    const command = args[0];
    args.shift(); // Remove first element

    return [command, args];
}

module.exports = {
    extractCommand
};
