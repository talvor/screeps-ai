import { minionCanWork } from "Tasks/Prerequisites/minion-can-work";
import { minionHasEnergy } from "Tasks/Prerequisites/minion-has-energy";
import { minionIsNear } from "Tasks/Prerequisites/minion-is-near";
import { BaseTaskAction, TaskAction, TaskActionType } from "Tasks/task";

class UpgradeAction extends BaseTaskAction<StructureController, undefined> {
  type = TaskActionType.UPGRADE;

  action(creep: Creep, ta: TaskAction) {
    // If creep has no energy end task;
    if (creep.store.getUsedCapacity() === 0) return true;

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
  cost(creep: Creep, ta: TaskAction) {
    const id = ta.target as Id<StructureController>;
    const target = Game.getObjectById(id);
    if (!target) throw new Error("Could not find target");
    creep.pos.getRangeTo(target.pos);
  }

  make(target: StructureController) {
    return {
      type: this.type,
      target: target.id,
      prereqs: [minionCanWork.make(), minionHasEnergy.make(), minionIsNear.make(target.pos, 3)]
    };
  }
}

export const upgradeAction = new UpgradeAction();
