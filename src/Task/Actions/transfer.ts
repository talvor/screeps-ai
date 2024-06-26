import { TaskAction, TaskActionType, BaseTaskAction } from "Task/Actions/task-action";
import { moveAction } from "./move";

export type TransferTarget = StructureSpawn | StructureExtension | StructureTower;

class TransferAction extends BaseTaskAction<TransferTarget, undefined> {
  type = TaskActionType.TRANSFER;

  action(creep: Creep, ta: TaskAction) {
    // If creep has no energy end task;
    if (creep.store.getUsedCapacity() === 0) return true;

    // Move to location and continue only when we are there
    if (ta.moveAction && !moveAction.action(creep, ta.moveAction)) return false;

    const id = ta.target as Id<StructureSpawn | StructureExtension>;
    const target = Game.getObjectById(id);
    if (!target) return true;
    const code = creep.transfer(target, RESOURCE_ENERGY);
    if (code !== OK) {
      return true; // Unable to build, end task
    }
    return target.store.getFreeCapacity(RESOURCE_ENERGY) === 0; // Task complete when target is full
  }
  cost(creep: Creep, ta: TaskAction) {
    const id = ta.target as Id<TransferTarget>;
    const target = Game.getObjectById(id);
    if (!target) throw new Error("Could not find target");
    creep.pos.getRangeTo(target.pos);
  }

  make(target: TransferTarget) {
    return {
      type: this.type,
      target: target.id,
      moveAction: moveAction.make(target.pos, 1)
    };
  }
}

export const transferAction = new TransferAction();
