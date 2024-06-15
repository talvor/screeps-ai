import { harvestAction } from "Tasks/Actions/harvest";
import { BaseTaskPrerequisite, TaskAction, TaskPrerequisite, TaskPrerequisiteType } from "Tasks/task";

class MinionHasEnergy extends BaseTaskPrerequisite<undefined, undefined> {
  type = TaskPrerequisiteType.HAS_ENERGY;

  meets(creep: Creep) {
    return creep.store.getFreeCapacity() === 0;
  }
  toMeet(creep: Creep, _tp: TaskPrerequisite) {
    if (creep.store.getCapacity() === 0) return []; // Minion cannot carry

    const energySource = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (!energySource) return [];
    return [harvestAction.make(energySource)];
  }
}

export const minionHasEnergy = new MinionHasEnergy();
