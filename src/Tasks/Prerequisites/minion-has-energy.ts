import { findClosestEnergySource } from "Selectors/creeps";
import { harvestAction } from "Tasks/Actions/harvest";
import { BaseTaskPrerequisite, TaskPrerequisite, TaskPrerequisiteType } from "Tasks/task";

class MinionHasEnergy extends BaseTaskPrerequisite<undefined, undefined> {
  type = TaskPrerequisiteType.HAS_ENERGY;

  meets(creep: Creep) {
    return creep.store.getFreeCapacity() === 0;
  }
  toMeet(creep: Creep, _tp: TaskPrerequisite) {
    if (creep.store.getCapacity() === 0) return []; // Minion cannot carry

    const energySource = findClosestEnergySource(creep);
    if (energySource) {
      return [harvestAction.make(energySource)];
    }
    return [];
  }
}

export const minionHasEnergy = new MinionHasEnergy();
