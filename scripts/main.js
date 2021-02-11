'use strict';
require('./scripts/core/fox.js');
require('./scripts/cmd/accountCmd.js');
require('./scripts/cmd/characterCmd.js');

// Default stuff
revmp.createInstanceTemplate({
    type: revmp.InstanceType.Character,
    id: "revmp_pc_hero",
    name: "Ich",
    maxHealth: 100,
    maxMana: 10,
    attributes: {
        strength: 10,
        dexterity: 10,
    },
    meleeAttack: {
        blunt: 5,
        range: 40,
    },
    visual: "humans.mds",
    visualBody: {
        bodyMesh: "hum_body_Naked0",
        bodyTexture: 9,
        headMesh: "Hum_Head_Pony",
        headTexture: 18,
    },
});

revmp.createInstanceTemplate({
    type: revmp.InstanceType.World,
    id: "new_world",
    name: "New World",
    zen: "NEWWORLD\\NEWWORLD.ZEN",
    waypoint: "NW_CITY_HABOUR_02_B",
});

const world = revmp.createWorld("new_world");
revmp.setTime(world, { hour: 15, minute: 0 });
