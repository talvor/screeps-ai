import { moveAction } from "Tasks/Actions/move";
import { BaseTaskPrerequisite, TaskAction, TaskPrerequisite, TaskPrerequisiteType } from "Tasks/task";
import { packPos, unpackPos } from "utils/position";

class MinionIsOn extends BaseTaskPrerequisite<RoomPosition | Source, undefined> {
  type = TaskPrerequisiteType.IS_ON;

  toMeet(_creep: Creep, tp: TaskPrerequisite): Array<TaskAction> {
    const { pos } = this.decodeTP(tp);
    return [moveAction.make(pos, 0)];
  }
  meets(_creep: Creep, _tp: TaskPrerequisite) {
    // const { pos, distance } = this.decodeTP(tp);
    // return creep.pos.inRangeTo(pos, distance);
    return false;
  }

  make(target: RoomPosition | Source) {
    const pos = target instanceof Source ? target.pos : target;
    return {
      type: this.type,
      target: packPos(pos)
    };
  }

  private decodeTP(tp: TaskPrerequisite): { pos: RoomPosition } {
    if (!tp.target) throw new Error(`TaskPrerequisite ${this.type} requires a target`);
    const pos = unpackPos(tp.target);
    return { pos };
  }
}

export const minionIsOn = new MinionIsOn();
