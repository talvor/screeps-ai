import { TaskAction, TaskActionType, BaseTaskAction } from "Task/Actions/task-action";
import { moveAction } from "./move";

class RepairAction extends BaseTaskAction<Structure, undefined> {
  type = TaskActionType.REPAIR;

  action(creep: Creep, ta: TaskAction) {
    // Move to location and continue only when we are there
    if (ta.moveAction && !moveAction.action(creep, ta.moveAction)) return false;

    // If creep has no energy end task;
    if (creep.store.getUsedCapacity() === 0) return true;

    const targetId = ta.target as Id<Structure>;
    const target = Game.getObjectById(targetId);
    if (!target) {
      console.log(`Repair: target not found id=${targetId} creep=${creep.name}`);
      return true;
    }
    const code = creep.repair(target);
    if (code == OK) {
      return target.hitsMax === target.hits;
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
