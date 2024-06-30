import { TaskAction, TaskActionType, BaseTaskAction } from "Task/Actions/task-action";
import { findClosestDepositStructure } from "Selectors/creeps";
import { moveAction } from "./move";

type DepositTarget = StructureContainer | StructureStorage;
class DepositAction extends BaseTaskAction<DepositTarget | undefined, undefined> {
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
      const distance = target.structureType === STRUCTURE_CONTAINER ? 0 : 1;
      if (!creep.pos.inRangeTo(target, distance)) {
        creep.moveTo(target);
        return false;
      }
    }

    let code;
    if (target?.structureType === STRUCTURE_CONTAINER) code = creep.drop(RESOURCE_ENERGY);
    if (target?.structureType === STRUCTURE_STORAGE) code = creep.transfer(target, RESOURCE_ENERGY);
    if (code !== OK) {
      return true; // Unable to build, end task
    }

    return false;
  }
  make(depositTarget: DepositTarget | undefined = undefined) {
    return {
      type: this.type,
      target: depositTarget ? depositTarget.id : undefined
    };
  }
}

export const depositAction = new DepositAction();
