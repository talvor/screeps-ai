import { TaskAction, TaskActionType, BaseTaskAction } from "Task/Actions/task-action";
import { moveAction } from "./move";
import { packPos } from "utils/position";

class DropAction extends BaseTaskAction<RoomPosition, undefined> {
  type = TaskActionType.DROP;

  action(creep: Creep, ta: TaskAction) {
    // If creep has no energy end task;
    if (creep.store.getUsedCapacity() === 0) return true;

    if (ta.moveAction && !moveAction.action(creep, ta.moveAction)) return false;

    if (creep.drop(RESOURCE_ENERGY) !== OK) {
      ta.moveAction = undefined;
      return true; // Unable to build, end task
    }
    return false; // Task is not complete
  }

  make(target: RoomPosition) {
    return {
      type: this.type,
      target: packPos(target),
      moveAction: moveAction.make(target, 0)
    };
  }
}

export const dropAction = new DropAction();
