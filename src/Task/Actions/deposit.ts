import { TaskAction, TaskActionType, BaseTaskAction } from "Task/Actions/task-action";
import { findClosestDepositStructure } from "Selectors/creeps";

type DepositTarget = StructureContainer;
class DepositAction extends BaseTaskAction<undefined, undefined> {
  type = TaskActionType.DEPOSIT;

  action(creep: Creep, ta: TaskAction) {
    // If creep has no energy end task;
    if (creep.store.getUsedCapacity() === 0) return true;

    let target: DepositTarget | null;

    if (!ta.target) {
      target = findClosestDepositStructure(creep, s => s.store.getFreeCapacity() > 0) || null;
      if (target) {
        ta.target = target.id;
      }
    } else {
      target = Game.getObjectById(ta.target as Id<DepositTarget>);
    }

    if (target) {
      if (!creep.pos.inRangeTo(target, 0)) {
        creep.moveTo(target);
        return false;
      }
      ta.target = undefined;
    }
    if (creep.drop(RESOURCE_ENERGY) !== OK) {
      return true; // Unable to build, end task
    }

    return true;
  }
  make() {
    return {
      type: this.type,
      target: undefined
    };
  }
}

export const depositAction = new DepositAction();
