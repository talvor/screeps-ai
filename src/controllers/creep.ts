import { roleBuilder } from 'roles/builder';
import { roleHarvester } from 'roles/harvester';
import { roleMiner } from 'roles/miner';
import { roleUpgrader } from 'roles/upgrader';

class CreepController {
  public runAll(creeps: Creep[], hasTowers: IHasTowers): void {
    Object.values(creeps).forEach(creep => this.runSingeCreep(creep, hasTowers));
  }

  private runSingeCreep(creep: Creep, hasTowers: IHasTowers): void {
    if (creep.spawning || !this.preRun(creep)) {
      return;
    }

    roleHarvester.run(creep);
    roleBuilder.run(creep, hasTowers);
    roleUpgrader.run(creep);
    roleMiner.run(creep);
  }

  private preRun(creep: Creep): boolean {
    if (creep.ticksToLive === 1) {
      creep.say('☠️ dying');
      // console.log(`${creep} ${creep.pos} died naturally.`);
      for (const resourceType in creep.store) {
        creep.drop(resourceType as ResourceConstant);
      }
      // TODO Inform a Spawner to replace the creep.
      delete Memory.creeps[creep.name];
      return false;
    }

    if (!creep.memory.origin) {
      creep.memory.origin = creep.room.name;
    }

    if (creep.memory.full && creep.store.energy === 0) {
      delete creep.memory.full;
      delete creep.memory.rechargeId;
    }

    if (!creep.memory.full && creep.store.energy === creep.store.getCapacity()) {
      delete creep.memory.sId;
      delete creep.memory.repairId;
      creep.memory.full = true;
    }
    return true;
  }
}

export const creepController = new CreepController();
