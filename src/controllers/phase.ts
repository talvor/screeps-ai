import { ROLES } from '../constants';
import { structLink } from '../structures/link';
import { structStorage } from '../structures/storage';
import { structTower } from '../structures/tower';
type RoleFields = { [key in keyof typeof ROLES]?: IRole };

export interface IPhase extends RoleFields {
  level: number;
  checkLevelPeriod: number;
  spawnPeriod: number;
  checkGoal: (room: Room) => boolean;
  rampartDesiredHealth?: number;
}

const PHASE_INFO: IPhase[] = [
  {
    level: 0,
    checkLevelPeriod: 1001,
    spawnPeriod: 25,
    checkGoal: (): boolean => true
  },
  {
    // Intro level.
    level: 1,
    checkLevelPeriod: 1001,
    spawnPeriod: 25,
    checkGoal: (room: Room): boolean => {
      // Goal: build a container for each source and 5 extensions.
      let desiredExtensionCount = 5;
      let desiredContainerCount = (room.find(FIND_SOURCES) || {}).length || 0;
      const structures = room.find(FIND_STRUCTURES);

      for (const structure of structures) {
        if (structure.structureType === 'extension') {
          desiredExtensionCount--;
        } else if (structure.structureType === 'container') {
          desiredContainerCount--;
        } else if (structure.structureType === 'storage') {
          desiredContainerCount--;
        }

        if (desiredContainerCount <= 0 && desiredExtensionCount <= 0) {
          return true;
        }
      }
      console.log(`checkGoal container: ${desiredContainerCount}. ext: ${desiredExtensionCount}`);

      return false;
    },
    Harvester: {
      minimumEnergyToSpawn: 250,
      count: 3,
      parts: [WORK, CARRY, MOVE, MOVE, CARRY, WORK, MOVE, WORK, CARRY]
    },
    Upgrader: {
      count: 4,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE] // 250
    },
    Builder: {
      count: 4,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE, MOVE, CARRY, WORK, MOVE, WORK, CARRY]
    }
  },
  {
    // Extensions and containers built.
    level: 2,
    checkLevelPeriod: 1001,
    spawnPeriod: 50,
    checkGoal: (room: Room): boolean => {
      // Goal: Build one tower.
      const structures = room.find(FIND_MY_STRUCTURES);

      for (const structure of structures) {
        if (structure.structureType === 'tower') {
          return true;
        }
      }
      return false;
    },
    Harvester: {
      count: 2,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE, MOVE, CARRY, WORK, MOVE, WORK, CARRY]
    },
    Upgrader: {
      count: 3,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE, MOVE, CARRY, WORK, MOVE, WORK, CARRY]
    },
    Builder: {
      count: 4,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE, MOVE, CARRY, WORK, MOVE, WORK, CARRY]
    },
    Miner: {
      count: LOOK_SOURCES,
      minimumEnergyToSpawn: 250,
      // minimumEnergyToSpawn: 700,
      parts: [MOVE, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE] // 700
    }
  },
  {
    // Build two towers & one Storage
    level: 3,
    rampartDesiredHealth: 30 * 1000,
    checkLevelPeriod: 1001,
    spawnPeriod: 100,
    checkGoal: (room: Room): boolean => {
      const towers = structTower.getMyStructs(room);
      const storages = structStorage.getMyStructs(room);
      console.log(`checkGoal towers: ${towers.length} storage: ${storages.length}`);
      return towers.length > 1 && storages.length > 0;
    },
    Harvester: {
      count: 4,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY]
    },
    Upgrader: {
      count: 4,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE, MOVE, CARRY, WORK, MOVE, WORK, CARRY]
    },
    Builder: {
      count: 4,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE, MOVE, CARRY, WORK, MOVE, WORK, CARRY]
    },
    Miner: {
      count: LOOK_SOURCES,
      minimumEnergyToSpawn: 700,
      parts: [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE] // 700
    }
  },
  {
    // Build defenses
    level: 4,
    rampartDesiredHealth: 30 * 1000,
    checkLevelPeriod: 1001,
    spawnPeriod: 100,
    checkGoal: (): boolean => false,
    Harvester: {
      count: (spawner: StructureSpawn) => {
        const links = structLink.getMyStructs(spawner.room);
        return links.length;
      },
      minimumEnergyToSpawn: 250,
      parts: [MOVE, WORK, CARRY, MOVE, WORK, CARRY, WORK, CARRY]
    },
    Upgrader: {
      count: 4,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE, MOVE, CARRY, WORK, MOVE, WORK, CARRY]
    },
    Builder: {
      count: 2,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE, MOVE, CARRY, WORK, MOVE, WORK, CARRY]
    },
    Miner: {
      count: LOOK_SOURCES,
      minimumEnergyToSpawn: 700,
      parts: [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE] // 700
    }
  }
];

export class PhaseController {
  private getPhaseInfo(phaseNumber: number): IPhase {
    phaseNumber = phaseNumber || 1;
    return PHASE_INFO[phaseNumber];
  }

  public getCurrentPhaseInfo(room: Room): IPhase {
    let num = this.getCurrentPhaseNumber(room);

    while (!PHASE_INFO[num]) {
      num--;
      if (num < 0) {
        throw new Error('Phase do not exist!');
      }
    }
    return this.getPhaseInfo(num);
  }

  public getCurrentPhaseNumber(room: Room): number {
    return room.memory.phase || 1;
  }

  public determineCurrentPhaseNumber(room: Room | string): number {
    const roomName = (room as Room).name || (room as string);
    room = Game.rooms[roomName];

    const phaseNo = Memory.rooms[roomName].phase || 1;
    const phase = this.getPhaseInfo(phaseNo);
    const period = phase.checkLevelPeriod;
    const checkGoal = phase.checkGoal;

    // We don't need to check on every tick
    if (Game.time % period === 0 && checkGoal(room)) {
      room.memory.phase++;
      console.log(`Updated ${room.name} phase to ${Memory.rooms[roomName].phase}`);
    }
    // TODO: Rooms that don't have a controller?
    room.memory.phase = room.memory.phase || 1;
    return room.memory.phase;
  }
}

export const phaseController = new PhaseController();
