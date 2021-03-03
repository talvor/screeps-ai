import { AVOID_LIST } from 'utils/Avoid';
import { StructBase } from './base';
import { phaseController } from 'controllers/phase';
import { roleHarvester } from 'roles/harvester';
import { roleUpgrader } from 'roles/upgrader';

export class StructSpawner extends StructBase {
  public constructor() {
    const modifiedSource = Object.assign({}, AVOID_LIST[LOOK_SOURCES], { range: 3 });

    super(STRUCTURE_SPAWN, {
      minFreeAdjSpaces: 3,
      minPlacementDistance: 3,
      avoidList: [
        AVOID_LIST[STRUCTURE_ROAD],
        AVOID_LIST[STRUCTURE_SPAWN],
        AVOID_LIST[STRUCTURE_CONTROLLER],
        AVOID_LIST[STRUCTURE_EXTENSION],
        AVOID_LIST[STRUCTURE_CONTAINER],
        AVOID_LIST[STRUCTURE_STORAGE],
        modifiedSource
      ]
    });
  }

  public run(spawner: StructureSpawn): void {
    phaseController.determineCurrentPhaseNumber(spawner.room);

    const phase = phaseController.getCurrentPhaseInfo(spawner.room);

    if (!spawner.memory.setup) {
      console.log(`${spawner.name} coming online in ${spawner.room.name}`);
      spawner.memory.setup = 1; // only setup once
      spawner.memory.level = spawner.room.controller?.level;

      // create a creep immediately
      roleHarvester.spawn(spawner);
    }
    if (spawner.memory.level !== spawner.room.controller?.level) {
      // We can build things!
      spawner.memory.level = spawner.room.controller?.level;

      // if (spawner.memory.setup < 2) {
      //   // Create network of roads to common places
      //   console.log('Create Network of Roads');
      //   const sources = spawner.room.find(FIND_SOURCES);
      //   structRoad.connect(spawner, sources);
      //   if (spawner.room.controller) structRoad.connect(spawner.room.controller, sources);
      //   spawner.memory.setup = 2;
      // }
    }

    // Do not have all spawners run on the same tick.
    if (Game.time % phase.spawnPeriod === parseInt(spawner.name[spawner.name.length - 1], 10)) {
      if (spawner.spawning) return;

      if (roleHarvester.shouldSpawn(spawner)) {
        roleHarvester.spawn(spawner);
        // } else if (roleMiner.shouldSpawn(spawner)) {
        //   roleMiner.spawn(spawner);
        // } else if (roleBuilder.shouldSpawn(spawner)) {
        //   roleBuilder.spawn(spawner);
      } else if (roleUpgrader.shouldSpawn(spawner)) {
        roleUpgrader.spawn(spawner);
        // } else if (roleRemoteBuilder.shouldSpawn(spawner)) {
        //   roleRemoteBuilder.spawn(spawner);
        // } else if (roleSettler.shouldSpawn(spawner)) {
        //   roleSettler.spawn(spawner);
      }
    }

    if (spawner.spawning) {
      const spawningCreep = Game.creeps[spawner.spawning.name];
      spawner.room.visual.text('🛠️' + spawningCreep.name, spawner.pos.x + 1, spawner.pos.y, {
        align: 'left',
        opacity: 0.8
      });
    }
  }
}

export const structSpawner = new StructSpawner();
