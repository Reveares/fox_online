'use strict';
require('./core/fox.js');
require('./cmd/accountCmd.js');
require('./cmd/characterCmd.js');

revmp.createWorld({
    zen: "NEWWORLD/NEWWORLD.ZEN",
    startpoint: "NW_CITY_HABOUR_02_B",
    name: "New World",
    time: { hour: 15 }
});
