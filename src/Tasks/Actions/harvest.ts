import { minionCanCarry } from "Tasks/Prerequisites/minion-can-carry";
import { minionCanWork } from "Tasks/Prerequisites/minion-can-work";
import { minionIsNear } from "Tasks/Prerequisites/minion-is-near";
import { BaseTaskAction, TaskAction, TaskActionType } from "Tasks/task";

class HarvestAction extends BaseTaskAction<Source, undefined> {
  type = TaskActionType.HARVEST;

  action(creep: Creep, ta: TaskAction) {
    const sourceId = ta.target as Id<Source>;
    const source = Game.getObjectById(sourceId);
    if (!source) {
      console.log(`Harvest: source not found source=${sourceId} creep=${creep.name}`);
      return true;
    }
    const code = creep.harvest(source);
    if (code !== OK) {
      console.log(`Harvest: unable to harvest code=${code}`);
      return true; // Unable to harvest, end task
    }
    return creep.store.getFreeCapacity() === 0; // Task is not complete if creep still has capacity
  }

  make(target: Source): TaskAction {
    return {
      type: this.type,
      target: target.id,
      prereqs: [minionCanWork.make(), minionCanCarry.make(), minionIsNear.make(target, 1)]
    };
  }
}

export const harvestAction = new HarvestAction();
