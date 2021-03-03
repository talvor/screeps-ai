import { ROLES } from '../constants';
import { RoleBase } from './base';

const ROLE = ROLES.Harvester;

export class RoleHarvester extends RoleBase {
  public constructor() {
    super(ROLE);
  }

  public run(creep: Creep): boolean {
    if (creep.busy || !this.is(creep)) return false;

    if (!creep.memory.full) {
      this.harvest(creep);
    } else {
      this.recharge(creep);
    }
    return true;
  }

  private recharge(creep: Creep) {
    let structure: StructureExtension | StructureSpawn | StructureTower | StructureStorage | undefined;
    if (creep.memory.rechargeId) {
      structure = Game.getObjectById(creep.memory.rechargeId) as StructureExtension | StructureSpawn | StructureTower;

      if (!structure.store.getFreeCapacity()) {
        structure = undefined;
        delete creep.memory.rechargeId;
      }
    }

    if (!structure) {
      structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: s =>
          s.structureType === STRUCTURE_EXTENSION ||
          s.structureType === STRUCTURE_SPAWN ||
          s.structureType === STRUCTURE_TOWER
      }) as StructureExtension | StructureSpawn | StructureTower;

      if (!structure && creep.room.memory.storageId) {
        // if things do not need to be recharged, fill up storage.
        structure = Game.getObjectById(creep.room.memory.storageId) as StructureStorage;
      }
    }

    if (structure) {
      creep.memory.rechargeId = structure.id;
      const code = creep.transfer(structure, RESOURCE_ENERGY);

      this.emote(creep, '🔋charging', code);

      if (code === OK) {
        creep.busy = 1;
      } else if (code === ERR_NO_BODYPART) {
        // unable to energize?
        this.suicide(creep);
      } else if (code === ERR_NOT_IN_RANGE) {
        this.travelTo(creep, structure.pos, '#00FF3C'); // green
      }
    }
  }
}

export const roleHarvester = new RoleHarvester();
