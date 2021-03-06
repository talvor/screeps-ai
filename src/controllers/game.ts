import { buildController } from './build';
import { creepController } from './creep';
import { phaseController } from './phase';
import { roomController } from './room';
import { structContainer } from 'structures/container';
import { structExtension } from 'structures/extension';
import { structRoad } from 'structures/road';
import { structSpawner } from 'structures/spawner';

export class GameController {
  public preRun(): void {
    const phaseNumber = phaseController.getCurrentPhaseNumber(Game.spawns.Spawn1.room);
    const logger = console.log;
    let preamble = `#${Game.time}`;
    preamble += phaseNumber ? `[${phaseNumber}]` : '';

    // @ts-ignore
    console.log = event => logger(`${preamble} ${event}`);

    // console.log(`Current game tick is ${Game.time}`);

    if (!Memory.gcl) {
      Memory.gcl = 0;
      for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        if (room.controller && room.controller.my) {
          Memory.gcl++;
        }
      }
    }

    buildController.preRun();
    roomController.preRun();
  }

  public run(): void {
    const hasTowers: {
      [key: string]: boolean;
    } = {};

    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      let hasSpawner = false;
      const structures = room.find(FIND_MY_STRUCTURES, {
        filter: s => {
          return s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_TOWER;
        }
      });

      hasTowers[roomName] = false;

      for (const s of structures) {
        if (s.structureType === STRUCTURE_SPAWN) {
          hasSpawner = true;
          structSpawner.run(s);
        } else if (s.structureType === STRUCTURE_TOWER) {
          // Towers.run(s);
          hasTowers[roomName] = true;
        }
      }

      if (hasSpawner && Game.time % 100 === 3) {
        console.log('Attempting to build');
        roomController.checkCityMap(room);

        // release new work for the builders if possible
        buildController.execute(room);
      }

      // Claimed a new room, build a spawner
      if (!hasSpawner && room.controller?.my) {
        const sites = structSpawner.getMySites(room);
        if (sites.length === 0) {
          console.log(`${room.name} building first spawner`);
        }
      }
    }

    creepController.runAll(Object.values(Game.creeps));
  }

  public postRun(): void {
    // Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
      if (!(name in Game.creeps)) {
        delete Memory.creeps[name];
      }
    }

    structRoad.gc();
    buildController.gc();
  }
}

export const gameController = new GameController();
