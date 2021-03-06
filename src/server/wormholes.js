import Jumps from '../../data/jumps';
import Statics from '../../data/statics';
import Systems from '../../data/systems';
import Wormholes from '../../data/wormholes';
import {AddRequest} from './ws';

function GetClassString(system) {
    if (system.security >= 1 && system.security <= 6) {
        return "C" + system.security;
    }
    if (system.security >= 7 && system.security <= 9) {
        if (system.system_security >= 0.45) return 'H';
        if (system.system_security > 0) return 'L';
        return 'N';
    }
    return "SH";
}

function BuildSystemData(systemId) {
    var system = Systems.filter(v => v.system_id == systemId);
    if (system.length <= 0) return false;
    system = system[0];

    var statics = Statics.hasOwnProperty(system.constellation_id) ? Statics[system.constellation_id] : [];
    statics = statics.map(v => Wormholes.filter(w => w.id == v)[0]);

    var nickname = "Unnamed";
    var classStr = GetClassString(system);
    if (['H', 'L', 'N'].indexOf(classStr) !== -1) {
        nickname = system.system_name;
    }

    return {
        id: system.system_id,
        system: system.system_name,
        class: classStr,
        region: system.region_name,
        statics: statics,
        effect: system.effect,
        pos: {x: 0, y: 0},
        nickname: nickname,
        locked: false,
        sigs: [],
        scantime: 0,
        discover: false,
        corp: false,
    };
}

AddRequest('search_systems', function(data) {
    if (data.length <= 0) return [];
    return Systems.filter(v => v.system_name.toLowerCase().substr(0, data.length) == data).slice(0, 10).map(v => ({
        id: v.system_id,
        name: v.system_name,
    }));
});

function DoesKJumpExist(from, to) {
    if (!from) return false;
    if (!Jumps[from]) return false;
    if (Jumps[from].indexOf(to) === -1) return false;
    return true;
}

export {DoesKJumpExist};

export default BuildSystemData;
