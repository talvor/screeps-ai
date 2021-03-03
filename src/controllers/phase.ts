import { ROLES } from '../constants';

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

        // console.log(`container: ${desiredContainerCount}. ext: ${desiredExtensionCount}`);
        if (desiredContainerCount <= 0 && desiredExtensionCount <= 0) {
          return true;
        }
      }
      return false;
    },
    Harvester: {
      minimumEnergyToSpawn: 250,
      count: 2,
      parts: [WORK, CARRY, MOVE] // 250
    },
    Upgrader: {
      count: 4,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE] // 250
    },
    Builder: {
      count: 4,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE] // 250
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
      count: 1,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE, MOVE, CARRY, WORK, MOVE, WORK, CARRY]
    },
    Upgrader: {
      count: 3,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE, MOVE, CARRY, WORK, MOVE, WORK, CARRY]
    },
    Builder: {
      count: 2,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE, MOVE, CARRY, WORK, MOVE, WORK, CARRY]
    }
  },
  {
    // Build defenses
    level: 3,
    rampartDesiredHealth: 30 * 1000,
    checkLevelPeriod: 1001,
    spawnPeriod: 50,
    checkGoal: (): boolean => false,
    Harvester: {
      count: 1,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY]
    },
    Upgrader: {
      count: 2,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE, MOVE, CARRY, WORK, MOVE, WORK, CARRY]
    },
    Builder: {
      count: 3,
      minimumEnergyToSpawn: 250,
      parts: [WORK, CARRY, MOVE, MOVE, CARRY, WORK, MOVE, WORK, CARRY]
    }
  }
];

export class PhaseController {
  private getPhaseInfo(phaseNumber: number): IPhase {
    return PHASE_INFO[phaseNumber - 1];
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
