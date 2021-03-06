import { check, errorEmoji } from 'utils/errors';

import { ROLES } from '../constants';
import { phaseController } from 'controllers/phase';
import { structRoad } from 'structures/road';

const STORAGE_MINIMUM = 100;
export abstract class RoleBase {
  private roleName: ROLES;

  public constructor(role: ROLES) {
    this.roleName = role;
  }

  public is(creep: Creep): boolean {
    return creep.name.startsWith(this.roleName);
  }

  public suicide(creep: Creep): void {
    // unable to move?
    creep.say('💀 suicide');
    console.log(`${creep.name} is suiciding`);
    creep.busy = 1;
    creep.suicide();
  }

  public emote(creep: Creep, phrase: string, code: number = OK, errorList: number[] = [OK, ERR_NOT_IN_RANGE]): boolean {
    if (!phrase || creep.memory._say === phrase) return false;
    if (undefined === errorList.find(c => c === code)) return false;

    if (OK === creep.say(phrase)) {
      creep.memory._say = phrase;
      return true;
    }
    return false;
  }

  public travelTo(
    creep: Creep,
    target: RoomPosition | StructureStorage | StructureContainer | Source,
    color: string,
    disableRoadCheck?: boolean
  ): number | undefined {
    const opts: MoveToOpts = {};

    if (creep.busy) {
      return;
    }
    if (color) {
      opts.visualizePathStyle = { stroke: color, opacity: 1, lineStyle: 'dotted' };
    }

    const code = creep.moveTo(target, opts);
    if (code === ERR_NO_PATH) {
      // ignore these. We can't cound blocked, because they re-path after 5 turns.
      creep.say(errorEmoji[ERR_NO_PATH]);
      return OK;
    }

    check(creep, `moveTo ${target}`, code);
    if (code === OK || code === ERR_TIRED) {
      creep.busy = 1;
      if (code === OK && creep.memory.blocked && --creep.memory.blocked >= 0) {
        delete creep.memory.blocked;
      }
      if (!disableRoadCheck) {
        structRoad.shouldBuildAt(creep);
      }
      return OK;
    } else if (code === ERR_NO_BODYPART) {
      // unable to move?
      this.suicide(creep);
    }
    return code;
  }

  private pickupFallenResource(creep: Creep): boolean {
    if (creep.name.startsWith(ROLES.Harvester)) return false;

    let resource: Resource | null = null;
    if (!creep.memory.fallenResourceId) {
      resource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES) as Resource;
    } else {
      try {
        resource = Game.getObjectById(creep.memory.fallenResourceId) as Resource;
      } catch (err) {
        // Object was already picked up.
      }
    }

    if (!resource) {
      delete creep.memory.fallenResourceId;
      return false;
    }

    creep.memory.fallenResourceId = resource.id;
    const code = creep.pickup(resource);
    this.emote(creep, '👏️ pickup');

    if (code === ERR_NOT_IN_RANGE) {
      this.travelTo(creep, resource.pos, '#ffaa00', true);
    } else if (code === OK) {
      delete creep.memory.fallenResourceId;
      creep.busy = 1;
    } else {
      delete creep.memory.fallenResourceId;
      try {
        // If the resource no longer exists, this will throw an error
        check(creep, `pickup(${resource} ${resource.pos})`, code);
      } catch (ex) {
        // ignore error
      }
      return false;
    }
    return true;
  }

  public harvest(creep: Creep): StructureStorage | StructureContainer | Source | undefined {
    let source: StructureStorage | StructureContainer | Source | undefined;

    if (creep.busy) return;

    if (creep.memory.sId) {
      source = Game.getObjectById(creep.memory.sId) as StructureStorage | StructureContainer | Source;
    }

    if (!source) {
      if (this.pickupFallenResource(creep)) {
        return;
      } else {
        source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: s => {
            // if (creep.name.startsWith(ROLES.Harvester)) return false;
            return (
              (s.structureType === 'storage' || s.structureType === 'container') &&
              s.store.getUsedCapacity() > STORAGE_MINIMUM
            );
          }
        }) as StructureStorage | StructureContainer;
      }
      if (!source) {
        source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE) as Source;
      }
    }
    if (source) {
      creep.memory.sId = source.id;
      let code;

      if (source instanceof Source || source instanceof Mineral) {
        code = creep.harvest(source);
      } else {
        code = creep.withdraw(source, RESOURCE_ENERGY);
      }

      this.emote(creep, '🔄 harvest', code);

      if (code === OK) {
        delete creep.memory.sId;
      } else if (code === ERR_NOT_IN_RANGE) {
        // code = this.travelTo(creep, source, '#ffaa00', creep.memory.noRoads || opts.notBuildRoads); // orange
        code = this.travelTo(creep, source, '#ffaa00'); // orange
        // What about using Storage???
      } else if (code === ERR_NOT_ENOUGH_RESOURCES) {
        delete creep.memory.sId;
      } else if (code === ERR_NO_BODYPART) {
        // unable to harvest?
        this.suicide(creep);
      }
    } else if (!creep.busy && this.emote(creep, '😰 No Srcs')) {
      console.log(`${creep} at ${creep.pos} could not find any available sources`);
    }
    creep.busy = 1;
    return source;
  }

  public shouldSpawn(spawner: StructureSpawn): boolean {
    const roomName = spawner.room.name;
    const phase = phaseController.getCurrentPhaseInfo(spawner.room);
    const phaseRole = phase[this.roleName] as IRole;
    const creeps = _.filter(
      Game.creeps,
      creep => (roomName === creep.room.name || phaseRole.shardwide) && this.is(creep)
    );
    const count = creeps.length;

    if (!phaseRole) {
      // console.log(`No entry for role ${this.roleName} in Phase ${phase.level}`);
      return false;
    }

    let desiredCount = 0;
    if (typeof phaseRole.count === 'number') {
      desiredCount = phaseRole.count;
    } else if (phaseRole.count === LOOK_SOURCES) {
      const objs = spawner.room.find(FIND_SOURCES) || [];
      desiredCount = objs.length || 0;
    } else {
      console.log(
        `count for role ${this.roleName} in Phase ${
          phase.level
        } needs to be a string or number: ${typeof phaseRole.count}`
      );
    }

    let hasEnoughEnergy = true;
    if (phaseRole.minimumEnergyToSpawn) {
      // optional field
      hasEnoughEnergy = phaseRole.minimumEnergyToSpawn < spawner.room.energyAvailable;
    }
    return count < desiredCount && hasEnoughEnergy;
  }

  public spawn(spawner: StructureSpawn): number {
    const phase = phaseController.getCurrentPhaseInfo(spawner.room);
    const phaseRole = phase[this.roleName] as IRole;
    const availableBodyParts = phaseRole.parts;
    const bodyParts: BodyPartConstant[] = [];
    const action = 'spawnCreep';
    let cost = 0;

    // console.log(`${phase.level} parts ` +JSON.stringify(availableBodyParts));

    for (const bodyPart of availableBodyParts) {
      bodyParts.push(bodyPart);
      cost = this.bodyPartCost(bodyParts);
      if (cost > spawner.room.energyAvailable) {
        // we found our limit, remove the excess body part and spawn.
        bodyParts.pop();
        cost -= BODYPART_COST[bodyPart];
        break;
      }
    }

    const label = `${this.roleName}${Game.time}`;
    console.log(`Spawning ${label} ` + JSON.stringify(bodyParts) + ` cost ${cost}/${spawner.room.energyAvailable}`);
    const code = spawner[action](bodyParts, label);

    check(spawner, action, code);
    return code;
  }

  public bodyPartCost(bodyParts: BodyPartConstant[]): number {
    return bodyParts.reduce((acc, part) => {
      return acc + BODYPART_COST[part];
    }, 0);
  }

  public build(creep: Creep): boolean | undefined {
    const targetId = creep.memory.cId;
    let target: Structure | ConstructionSite | null = null;

    if (targetId) {
      target = Game.getObjectById(targetId) as Structure | ConstructionSite;
      if (!target) {
        // the thing we were building is done. Find something else to do on this tick.
        delete creep.memory.cId;
      }
    }
    if (!target) {
      target = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES) as ConstructionSite;
      // target = creep.room.find(FIND_CONSTRUCTION_SITES)[0];
    }

    if (target) {
      creep.memory.cId = target.id;

      const code = creep.build(target as ConstructionSite);
      this.emote(creep, '🚧 build', code);
      if (code === OK) {
        creep.busy = 1;
      } else if (code === ERR_NOT_IN_RANGE) {
        this.travelTo(creep, target.pos, '#ffe56d');
      } else if (code === ERR_INVALID_TARGET) {
        delete creep.memory.cId;
      } else if (code === ERR_NO_BODYPART) {
        // unable to build?
        this.suicide(creep);
      }
    } else if (targetId) {
      delete creep.memory.cId;
    }
    return true;
  }

  public waitAtFlag(creep: Creep): void {
    const flag = creep.room.find(FIND_FLAGS, { filter: (f: Flag) => f.name === 'WaitPoint' })[0];
    if (flag) {
      this.emote(creep, '🚏 waiting');
      this.travelTo(creep, flag.pos, '#00FF3C'); // green
    }
  }
}
