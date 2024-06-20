import { BaseTaskAction, TaskAction, TaskActionEmoji, TaskActionType } from "Task/task";
import { moveAction } from "./move";

class RepairAction extends BaseTaskAction<Structure, undefined> {
  type = TaskActionType.REPAIR;

  action(creep: Creep, ta: TaskAction) {
    // Move to location and continue only when we are there
    if (ta.moveAction && !moveAction.action(creep, ta.moveAction)) return false;

    // If creep has no energy end task;
    if (creep.store.getUsedCapacity() === 0) return true;
    creep.say(`${TaskActionEmoji[ta.type]} ${ta.type}`);

    const targetId = ta.target as Id<Structure>;
    const target = Game.getObjectById(targetId);
    if (!target) {
      console.log(`Repair: target not found id=${targetId} creep=${creep.name}`);
      return true;
    }
    const code = creep.repair(target);
    console.log(`RepairAction: code=${code} target=${target.structureType} id=${targetId}`);
    if (code == OK) {
      return target.hitsMax === target.hits;
      // return true; // Unable to harvest, end task
    }
    return false; // Task is not complete
  }

  make(target: Structure) {
    return {
      type: this.type,
      target: target.id,
      moveAction: moveAction.make(target.pos, 3)
    };
  }
}

export const repairAction = new RepairAction();
