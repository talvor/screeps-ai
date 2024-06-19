import { minionCanCarry } from "Tasks/Prerequisites/minion-can-carry";
import { minionHasEnergy } from "Tasks/Prerequisites/minion-has-energy";
import { minionIsNear } from "Tasks/Prerequisites/minion-is-near";
import { BaseTaskAction, TaskAction, TaskActionType } from "Tasks/task";

export type TransferTarget = StructureSpawn | StructureExtension | StructureTower;

class TransferAction extends BaseTaskAction<TransferTarget, undefined> {
  type = TaskActionType.TRANSFER;

  action(creep: Creep, ta: TaskAction) {
    // If creep has no energy end task;
    if (creep.store.getUsedCapacity() === 0) return true;

    const id = ta.target as Id<StructureSpawn | StructureExtension>;
    const target = Game.getObjectById(id);
    if (!target || creep.transfer(target, RESOURCE_ENERGY) !== OK) {
      return true; // Unable to build, end task
    }
    return false; // Task is not complete
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
      prereqs: [minionCanCarry.make(), minionHasEnergy.make(), minionIsNear.make(target.pos, 1)]
    };
  }
}

export const transferAction = new TransferAction();
