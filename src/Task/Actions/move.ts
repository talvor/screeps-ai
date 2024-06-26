import { TaskAction, TaskActionType, BaseTaskAction } from "Task/Actions/task-action";
import { moveTo } from "screeps-cartographer";
import { packPos, unpackPos } from "utils/position";

class MoveAction extends BaseTaskAction<RoomPosition, number> {
  type = TaskActionType.MOVE;

  action(creep: Creep, ta: TaskAction) {
    try {
      const { target, distance } = this.decodeTA(ta);
      if (!target) return true;

      if (creep.pos.inRangeTo(target, distance)) return true;

      const opts: MoveToOpts = {};
      opts.visualizePathStyle = { stroke: "#ffaa00", opacity: 0.5, lineStyle: "dotted" };
      let result: number = moveTo(creep, target, opts);

      // There is an issue with the screeps-cartographer version of moveTo
      // It has difficulty moving onto an exact location if distance is 0
      // so fallback to creep.moveTo
      if (result === OK && distance === 0) {
        result = creep.moveTo(target);
      }
      if (
        result === ERR_NO_PATH ||
        result === ERR_NOT_OWNER ||
        result === ERR_NO_BODYPART // ||
        // result === ERR_INVALID_TARGET
      )
        return true; // Unrecoverable error
      return creep.pos.inRangeTo(target, distance);
    } catch (err) {
      console.log(err);
      return true;
    }
  }
  make(target: RoomPosition, distance = 0): TaskAction {
    return {
      type: this.type,
      target: packPos(target),
      params: { distance }
    };
  }

  decodeTA(ta: TaskAction): { target: RoomPosition; distance: number } {
    if (!ta.target) throw new Error(`TaskAction ${this.type} requires a target`);
    const pos = unpackPos(ta.target);
    let distance = 0;
    if (ta.params) {
      distance = (ta.params.distance as number) || 0;
    }
    return { target: pos, distance };
  }
}

export const moveAction = new MoveAction();
