import { StructBase } from './base';
import { phaseController } from 'controllers/phase';
import { roleBuilder } from 'roles/builder';
import { roleHarvester } from 'roles/harvester';
import { roleMiner } from 'roles/miner';
import { roleSettler } from 'roles/settler';
import { roleTransferrer } from 'roles/transferrer';
import { roleUpgrader } from 'roles/upgrader';
import { structRoad } from './road';

export class StructSpawner extends StructBase {
  public constructor() {
    super(STRUCTURE_SPAWN);
  }

  public run(spawner: StructureSpawn): void {
    if (!this.is(spawner)) return;
    phaseController.determineCurrentPhaseNumber(spawner.room);

    const phase = phaseController.getCurrentPhaseInfo(spawner.room);

    if (!spawner.memory.setup) {
      console.log(`${spawner.name} coming online in ${spawner.room.name}`);
      spawner.memory.setup = 1; // only setup once
      spawner.memory.level = spawner.room.controller?.level;

      // create a creep immediately
      roleHarvester.spawn(spawner);
    }
    if (spawner.room.controller && spawner.memory.level !== spawner.room.controller.level) {
      // We can build things!
      spawner.memory.level = spawner.room.controller.level;

      // Place Container for each Source for miners

      if (spawner.memory.setup < 2) {
        // Create network of roads to common places
        console.log('Create Network of Roads');
        const sources = spawner.room.find(FIND_SOURCES);
        structRoad.connect(spawner, sources);
        structRoad.connect(spawner.room.controller, sources);
        spawner.memory.setup = 2;
      }
    }

    // Do not have all spawners run on the same tick.
    if (Game.time % phase.spawnPeriod === parseInt(spawner.name[spawner.name.length - 1], 10)) {
      if (spawner.spawning) return;

      if (roleHarvester.shouldSpawn(spawner)) {
        roleHarvester.spawn(spawner);
      } else if (roleSettler.shouldSpawn(spawner)) {
        roleSettler.spawn(spawner);
      } else if (roleMiner.shouldSpawn(spawner)) {
        roleMiner.spawn(spawner);
      } else if (roleUpgrader.shouldSpawn(spawner)) {
        roleUpgrader.spawn(spawner);
      } else if (roleBuilder.shouldSpawn(spawner)) {
        roleBuilder.spawn(spawner);
      } else if (roleTransferrer.shouldSpawn(spawner)) {
        roleTransferrer.spawn(spawner);
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
