import { BaseTaskPrerequisite, TaskPrerequisiteType } from "Tasks/task";

class MinionCanMove extends BaseTaskPrerequisite<undefined, undefined> {
  type = TaskPrerequisiteType.CAN_MOVE;

  meets(creep: Creep) {
    return creep.getActiveBodyparts(MOVE) > 0;
  }
}

export const minionCanMove = new MinionCanMove();
