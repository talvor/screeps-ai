import { findLowHealthCreeps } from "Selectors/creeps";
import { findLowHealthStructure, findTowersInRoom } from "Selectors/structure";
import { healthRatio } from "utils/heath-ratio";

interface TowerMemory {
  isBusy: boolean;
  repairId?: Id<Structure>;
  healId?: Id<Creep>;
}
declare global {
  interface Memory {
    towers: Record<string, TowerMemory>;
  }
}

class StructureSupervisor {
  runTowers() {
    Memory.towers ??= {};
    const rooms = Object.values(Game.rooms);
    for (const room of rooms) {
      const towers = findTowersInRoom(room);
      towers.forEach(t => this.runTower(t));
    }
  }

  runTower(tower: StructureTower) {
    Memory.towers[tower.id] ??= { isBusy: false };
    const towerMem = Memory.towers[tower.id];

    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      console.log(`tower.attack - ${closestHostile}`);
      if (OK === tower.attack(closestHostile)) {
        towerMem.isBusy = true;
      }
    }

    const ratio = tower.store[RESOURCE_ENERGY] / tower.store.getCapacity(RESOURCE_ENERGY);
    if (ratio >= 0.5 && !towerMem.isBusy) {
      const threshold = this.getThreshold(ratio);

      this.repair(tower, threshold);
    }

    if (ratio >= 0.2 && !towerMem.isBusy) {
      this.heal(tower);
    }
  }

  public repair(tower: StructureTower, repairThreshold = 0.2, desiredHealthPercent = 0.95): void {
    const towerMem = Memory.towers[tower.id];
    let structure;

    if (!towerMem.repairId) {
      const structure = findLowHealthStructure(tower.room, repairThreshold);
      if (!structure) return;
      towerMem.repairId = structure.id;
    }

    if (towerMem.repairId) {
      structure = Game.getObjectById(towerMem.repairId);
      if (structure) {
        const ratio = healthRatio(structure.hits, structure.hitsMax);
        if (!structure || ratio > desiredHealthPercent) {
          structure = undefined;
          delete towerMem.repairId;
        }
      } else {
        delete towerMem.repairId;
      }

      if (structure) {
        const code = tower.repair(structure);
        if (code === ERR_INVALID_TARGET) {
          delete towerMem.repairId;
        } else if (code === OK) {
          // towerMem.isBusy = true;
        }
      }
    }
  }

  public heal(tower: StructureTower, healThreshold = 0.2, desiredHealthPercent = 0.95): void {
    const towerMem = Memory.towers[tower.id];

    let creep;

    if (!towerMem.healId) {
      creep = findLowHealthCreeps(tower.room, healThreshold);

      if (!creep) return;
      towerMem.healId = creep.id;
    }
    if (towerMem.healId) {
      creep = Game.getObjectById(towerMem.healId) as Creep;
      if (creep) {
        const ratio = healthRatio(creep.hits, creep.hitsMax);

        if (!creep || ratio > desiredHealthPercent) {
          creep = undefined;
          delete towerMem.healId;
        }
      } else {
        delete towerMem.healId;
      }

      if (creep) {
        const code = tower.heal(creep);
        if (code === ERR_INVALID_TARGET) {
          delete Memory.towers[tower.id].healId;
        } else if (code === OK) {
          // tower.busy = 1;
        }
      }
    }
  }

  private getThreshold(ratio: number, minRatio = 0.75, min = 0.2, max = 0.8): number {
    // if ratio is below min, cofficient is zero.
    const coefficient = Math.max(0, 4 * (ratio - minRatio));
    const threshold = min + coefficient * (max - min);

    return Math.max(0, threshold);
  }
}

export const structureSupervisor = new StructureSupervisor();
