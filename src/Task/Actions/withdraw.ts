import { TaskAction, TaskActionType, BaseTaskAction } from "Task/Actions/task-action";
import { moveAction } from "./move";

class WithdrawAction extends BaseTaskAction<StructureContainer, undefined> {
  type = TaskActionType.WITHDRAW;

  action(creep: Creep, ta: TaskAction) {
    // Move to location and continue only when we are there
    if (ta.moveAction && !moveAction.action(creep, ta.moveAction)) return false;

    const id = ta.target as Id<StructureContainer>;
    const target = Game.getObjectById(id);
    if (!target || creep.withdraw(target, RESOURCE_ENERGY) !== OK) {
      return true; // Unable to build, end task
    }
    return false; // Task is not complete
  }
  make(target: StructureContainer) {
    return {
      type: this.type,
      target: target.id,
      moveAction: moveAction.make(target.pos, 1)
    };
  }
}

export const withdrawAction = new WithdrawAction();
