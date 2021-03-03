import { ROLES } from '../constants';
import { RoleBase } from './base';
import { roleHarvester } from './harvester';
import { roomController } from 'controllers/room';

const ROLE = ROLES.Builder;

export class RoleBuilder extends RoleBase {
  public constructor() {
    super(ROLE);
  }

  public run(creep: Creep): boolean {
    if (creep.busy || !this.is(creep)) return false;

    // const skipRepair = hasTowers[creep.room.name];

    if (creep.memory.full) {
      // this.fortify(creep);

      // if (!creep.busy && !skipRepair) {
      if (!creep.busy) {
        this.repair(creep);
      }

      if (!creep.busy) {
        this.build(creep);
      }
    }
    if (!creep.memory.full || !creep.busy) {
      roleHarvester.harvest(creep);
    }

    return true;
  }

  private repair(creep: Creep, repairThreshold = 0.2, fixedThreshold = 0.95) {
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
      }
      if (code === ERR_NOT_IN_RANGE) {
        this.travelTo(creep, structure.pos, '#FF0000'); // red
      } else if (code === ERR_INVALID_TARGET) {
        console.log(`${creep.name} cannot repair ${structure.structureType}`);
        delete creep.memory.repairId;
      } else if (code === ERR_NO_BODYPART) {
        // unable to move?
        this.suicide(creep);
      }

      if (!creep.busy) {
        console.log(`find another repair $code}`);
        this.repair(creep, repairThreshold, fixedThreshold); // try again with a valid target
      }
    }
  }
}

export const roleBuilder = new RoleBuilder();
