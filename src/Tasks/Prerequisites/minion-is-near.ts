import { moveAction } from "Tasks/Actions/move";
import { BaseTaskPrerequisite, TaskAction, TaskPrerequisite, TaskPrerequisiteType } from "Tasks/task";
import { packPos, unpackPos } from "utils/position";

class MinionIsNear extends BaseTaskPrerequisite<RoomPosition | Source, number> {
  type = TaskPrerequisiteType.IS_NEAR;

  toMeet(_creep: Creep, tp: TaskPrerequisite): Array<TaskAction> {
    const { pos, distance } = this.decodeTP(tp);
    return [moveAction.make(pos, distance)];
  }
  meets(_creep: Creep, _tp: TaskPrerequisite) {
    // const { pos, distance } = this.decodeTP(tp);
    // return creep.pos.inRangeTo(pos, distance);
    return false;
  }

  make(target: RoomPosition | Source, distance: number) {
    const pos = target instanceof Source ? target.pos : target;
    return {
      type: this.type,
      target: packPos(pos),
      params: { distance }
    };
  }

  private decodeTP(tp: TaskPrerequisite): { pos: RoomPosition; distance: number } {
    if (!tp.target) throw new Error(`TaskPrerequisite ${this.type} requires a target`);
    const pos = unpackPos(tp.target);
    let distance = 1;
    if (tp.params) {
      distance = (tp.params.distance as number) || 1;
    }

    return { pos, distance };
  }
}

export const minionIsNear = new MinionIsNear();
