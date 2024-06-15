import { BaseTaskAction, TaskAction, TaskActionType } from "Tasks/task";
import { packPos, unpackPos } from "utils/position";

class MoveAction extends BaseTaskAction<RoomPosition, number> {
  type = TaskActionType.MOVE;

  action(creep: Creep, ta: TaskAction) {
    const { target, distance } = this.decodeTA(ta);
    const opts: MoveToOpts = {};
    opts.visualizePathStyle = { stroke: "#ffaa00", opacity: 1, lineStyle: "dotted" };
    let result = creep.moveTo(target, opts);
    if (
      result === ERR_NO_PATH ||
      result === ERR_NOT_OWNER ||
      result === ERR_NO_BODYPART ||
      result === ERR_INVALID_TARGET
    )
      return true; // Unrecoverable error
    return creep.pos.inRangeTo(target, distance);
  }
  cost(creep: Creep, ta: TaskAction) {
    const { target } = this.decodeTA(ta);
    creep.pos.getRangeTo(target);
  }
  make(target: RoomPosition, distance = 1): TaskAction {
    return {
      type: this.type,
      target: packPos(target),
      params: { distance },
      prereqs: []
    };
  }

  decodeTA(ta: TaskAction): { target: RoomPosition; distance: number } {
    if (!ta.target) throw new Error(`TaskAction ${this.type} requires a target`);
    const pos = unpackPos(ta.target);
    let distance = 1;
    if (ta.params) {
      distance = (ta.params.distance as number) || 1;
    }
    return { target: pos, distance };
  }
}

export const moveAction = new MoveAction();
