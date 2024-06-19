import { minionCanWork } from "Tasks/Prerequisites/minion-can-work";
import { minionIsOn } from "Tasks/Prerequisites/minion-is-on";
import { BaseTaskAction, TaskAction, TaskActionType } from "Tasks/task";
import { moveTo } from "screeps-cartographer";

type MineActionParams = { pos: RoomPosition; distance: number };

class MineAction extends BaseTaskAction<Source, MineActionParams> {
  type = TaskActionType.MINE;

  action(creep: Creep, ta: TaskAction) {
    const sourceId = ta.target as Id<Source>;
    const source = Game.getObjectById(sourceId);
    if (!source) {
      console.log(`Mine: source not found source=${sourceId} creep=${creep.name}`);
      return true;
    }
    moveTo(creep, source);
    const code = creep.harvest(source);
    if (code !== OK) {
      console.log(`Harvest: unable to harvest code=${code} creep=${creep.name}`);
      return true; // Unable to harvest, end task
    }
    return creep.store.getFreeCapacity() === 0; // Task is not complete if creep still has capacity
  }

  make(target: Source, params: MineActionParams): TaskAction {
    return {
      type: this.type,
      target: target.id,
      prereqs: [minionCanWork.make(), minionIsOn.make(params.pos)]
    };
  }
}

export const mineAction = new MineAction();
