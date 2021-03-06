import { ROLES } from '../constants';
import { RoleBase } from './base';
import { roomController } from 'controllers/room';

const ROLE = ROLES.Builder;

export class RoleBuilder extends RoleBase {
  public constructor() {
    super(ROLE);
  }

  public run(creep: Creep, hasTowers: IHasTowers): boolean {
    if (creep.busy || !this.is(creep)) return false;

    const skipRepair = hasTowers[creep.room.name];

    if (!creep.memory.full) {
      return this.harvest(creep);
    } else {
      if (this.build(creep)) {
        return true;
      } else if (!skipRepair && this.repair(creep)) {
        return true;
      } else if (this.upgrade(creep)) {
        return true;
      } else {
        this.waitAtFlag(creep);
      }
    }

    return false;
  }

  private repair(creep: Creep, repairThreshold = 0.2, fixedThreshold = 0.95): boolean {
    const repairId = creep.memory.repairId;
    let structure: AnyStructure | undefined;

    if (repairId) {
      structure = Game.getObjectById(repairId) as AnyStructure;
      const ratio = roomController.healthRatio(structure.hits, structure.hitsMax);

      if (ratio > fixedThreshold) {
        structure = undefined;
        delete creep.memory.repairId;
      }
    }

    if (!structure) {
      structure = roomController.findLowHealthStructures(creep.room, repairThreshold);
    }

    if (structure) {
      creep.memory.repairId = structure?.id;

      const code = creep.repair(structure);
      this.emote(creep, '🔧 repair', code);
      if (code === OK || code === ERR_NOT_ENOUGH_RESOURCES) {
        creep.busy = 1;
        return true;
      }
      if (code === ERR_NOT_IN_RANGE) {
        this.travelTo(creep, structure.pos, '#FF0000'); // red
        creep.busy = 1;
        return true;
      } else if (code === ERR_INVALID_TARGET) {
        console.log(`${creep.name} cannot repair ${structure.structureType}`);
        delete creep.memory.repairId;
      } else if (code === ERR_NO_BODYPART) {
        // unable to move?
        this.suicide(creep);
      }

      if (!creep.busy) {
        console.log(`find another repair $code}`);
        return this.repair(creep, repairThreshold, fixedThreshold); // try again with a valid target
      }
    }

    return false;
  }
}

export const roleBuilder = new RoleBuilder();
