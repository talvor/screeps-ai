import { ROLES, STORAGE_MINIMUM } from '../constants';

import { RoleBase } from './base';

const ROLE = ROLES.Harvester;

export class RoleHarvester extends RoleBase {
  public constructor() {
    super(ROLE);
  }

  public run(creep: Creep): boolean {
    if (creep.busy || !this.is(creep)) return false;

    if (!creep.memory.full) {
      return this.harvest(creep);
    } else {
      if (this.recharge(creep)) {
        return true;
      } else if (this.build(creep)) {
        return true;
      } else if (this.upgrade(creep)) {
        return true;
      } else {
        this.waitAtFlag(creep);
      }
    }

    return false;
  }

  public harvest(creep: Creep): boolean {
    let source: StructureLink | StructureStorage | StructureContainer | Source | undefined;

    if (creep.busy) return true;

    if (creep.memory.cId) {
      if (creep.store.energy) {
        return this.build(creep);
      } else {
        delete creep.memory.cId;
      }
    }

    if (creep.memory.sId) {
      source = Game.getObjectById(creep.memory.sId) as StructureStorage | StructureContainer | Source;
    }

    if (!source) {
      source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => s.structureType === 'container' && s.store.getUsedCapacity() > STORAGE_MINIMUM
      }) as StructureContainer;

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
        creep.busy = 1;
        return true;
      } else if (code === ERR_NOT_IN_RANGE) {
        // code = this.travelTo(creep, source, '#ffaa00', creep.memory.noRoads || opts.notBuildRoads); // orange
        code = this.travelTo(creep, source, '#ffaa00'); // orange
        creep.busy = 1;
        return true;
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
    return false;
  }

  public recharge(creep: Creep): boolean {
    let structure:
      | StructureExtension
      | StructureSpawn
      | StructureTower
      | StructureContainer
      | StructureStorage
      | StructureLink
      | undefined;
    if (creep.memory.rechargeId) {
      structure = Game.getObjectById(creep.memory.rechargeId) as StructureExtension | StructureSpawn | StructureTower;
      // | StructureContainer;

      if (!structure.store.getFreeCapacity()) {
        structure = undefined;
        delete creep.memory.rechargeId;
      }
    }

    if (!structure) {
      structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: s => {
          return (
            (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) &&
            s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        }
      }) as StructureExtension | StructureSpawn;

      if (!structure) {
        // if things do not need to be recharged, fill up storage.
        structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: s => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        }) as StructureTower;
      }

      if (!structure && creep.room.memory.storageId) {
        // if things do not need to be recharged, fill up storage.
        structure = Game.getObjectById(creep.room.memory.storageId) as StructureStorage;
      }
    }

    if (structure && structure.store) {
      creep.memory.rechargeId = structure.id;
      const code = creep.transfer(structure, RESOURCE_ENERGY);

      this.emote(creep, '🔋charging', code, [OK, ERR_NOT_IN_RANGE, ERR_FULL]);

      if (code === OK) {
        creep.busy = 1;
        return true;
      } else if (code === ERR_NOT_IN_RANGE) {
        this.travelTo(creep, structure.pos, '#00FF3C'); // green
        creep.busy = 1;
        return true;
      } else if (code === ERR_NO_BODYPART) {
        // unable to energize?
        this.suicide(creep);
      } else if (code === ERR_FULL) {
        delete creep.memory.rechargeId;
      }
    }
    return false;
  }
}

export const roleHarvester = new RoleHarvester();
