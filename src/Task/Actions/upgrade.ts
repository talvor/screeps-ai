import { BaseTaskAction, Task, TaskAction, TaskActionType } from "Task/task";
import { moveAction } from "./move";

class UpgradeAction extends BaseTaskAction<StructureController, undefined> {
  type = TaskActionType.UPGRADE;

  action(creep: Creep, ta: TaskAction) {
    // If creep has no energy end task;
    if (creep.store.getUsedCapacity() === 0) return true;

    // Move to location and continue only when we are there
    if (ta.moveAction && !moveAction.action(creep, ta.moveAction)) return false;

    const targetId = ta.target as Id<StructureController>;
    const target = Game.getObjectById(targetId);
    if (!target) {
      console.log(`Upgrade: target not found id=${targetId} creep=${creep.name}`);
      return true;
    }
    const code = creep.upgradeController(target);
    if (code !== OK) {
      return true; // Unable to harvest, end task
    }
    return false; // Task is not complete
  }

  shouldRepeatTask(_creep: Creep, _task: Task): boolean {
    return true;
  }

  make(target: StructureController) {
    return {
      type: this.type,
      target: target.id,
      moveAction: moveAction.make(target.pos, 3)
    };
  }
}

export const upgradeAction = new UpgradeAction();
