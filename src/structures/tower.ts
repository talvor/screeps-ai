import { check } from 'utils/errors';
import { roomController } from 'controllers/room';
import { StructBase } from './base';

export class StructTower extends StructBase {
  public constructor() {
    super(STRUCTURE_TOWER);
  }

  public preRun(): void {
    if (!Memory.towers) Memory.towers = {};
  }

  public run(tower: StructureTower): void {
    if (!this.is(tower)) return;

    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      console.log(`tower.attack - ${closestHostile}`);
      if (OK === tower.attack(closestHostile)) {
        tower.busy = 1;
      }
    }

    const ratio = tower.store[RESOURCE_ENERGY] / tower.store.getCapacity(RESOURCE_ENERGY);
    if (ratio >= 0.5 && !tower.busy) {
      const threshold = this.getThreshold(ratio);

      this.repair(tower, threshold);
    }

    if (ratio >= 0.2 && !tower.busy) {
      this.heal(tower);
    }
  }

  private getThreshold(ratio: number, minRatio = 0.75, min = 0.2, max = 0.8): number {
    // if ratio is below min, cofficient is zero.
    const coefficient = Math.max(0, 4 * (ratio - minRatio));
    const threshold = min + coefficient * (max - min);

    return Math.max(0, threshold);
  }

  public repair(tower: StructureTower, repairThreshold = 0.2, desiredHealthPercent = 0.95): void {
    if (!Memory.towers[tower.id]) Memory.towers[tower.id] = {};
    // if ((tower.room.controller as StructureController).level < 3) return;
    const repairId = Memory.towers[tower.id].repairId;
    let structure;

    if (!repairId) {
      structure = roomController.findLowHealthStructures(tower.room, repairThreshold);

      if (!structure) return;
      Memory.towers[tower.id].repairId = structure.id;
    }
    if (repairId) {
      structure = Game.getObjectById(repairId) as Structure;
      if (structure) {
        const ratio = roomController.healthRatio(structure.hits, structure.hitsMax);

        if (!structure || ratio > desiredHealthPercent) {
          structure = undefined;
          delete Memory.towers[tower.id].repairId;
          delete Memory.towers[tower.id]._say;
        }
      } else {
        delete Memory.towers[tower.id].repairId;
      }

      if (structure) {
        const code = tower.repair(structure);
        this.emote(tower, `🔧 repair ${structure.structureType} @ ${structure.pos}`, code);
        check(tower, `repair(${structure})`, code);
        if (code === ERR_INVALID_TARGET) {
          delete Memory.towers[tower.id].repairId;
        } else if (code === OK) {
          tower.busy = 1;
        }
      }
    }
  }

  public heal(tower: StructureTower, healThreshold = 0.2, desiredHealthPercent = 0.95): void {
    if (!Memory.towers[tower.id]) Memory.towers[tower.id] = {};
    // if ((tower.room.controller as StructureController).level < 3) return;
    const healId = Memory.towers[tower.id].healId;
    let creep;

    if (!healId) {
      creep = roomController.findLowHealthCreeps(tower.room, healThreshold);

      if (!creep) return;
      Memory.towers[tower.id].healId = creep.id;
    }
    if (healId) {
      creep = Game.getObjectById(healId) as Creep;
      if (creep) {
        const ratio = roomController.healthRatio(creep.hits, creep.hitsMax);

        if (!creep || ratio > desiredHealthPercent) {
          creep = undefined;
          delete Memory.towers[tower.id].healId;
          delete Memory.towers[tower.id]._say;
        }
      } else {
        delete Memory.towers[tower.id].healId;
      }

      if (creep) {
        const code = tower.heal(creep);
        this.emote(tower, `🧑‍⚕️ heal ${creep.name}`, code);
        check(tower, `heal(${creep})`, code);
        if (code === ERR_INVALID_TARGET) {
          delete Memory.towers[tower.id].healId;
        } else if (code === OK) {
          tower.busy = 1;
        }
      }
    }
  }

  public emote(
    tower: StructureTower,
    phrase: string,
    code: number = OK,
    errorList: number[] = [OK, ERR_NOT_IN_RANGE]
  ): void {
    if (!phrase || Memory.towers[tower.id]._say === phrase) return;
    if (undefined === errorList.find(c => c === code)) return;

    console.log(phrase);
    Memory.towers[tower.id]._say = phrase;
  }
}

export const structTower = new StructTower();
