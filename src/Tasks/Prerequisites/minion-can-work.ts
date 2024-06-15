import { BaseTaskPrerequisite, TaskPrerequisiteType } from "Tasks/task";

class MinionCanWork extends BaseTaskPrerequisite<undefined, undefined> {
  type = TaskPrerequisiteType.CAN_WORK;

  meets(creep: Creep) {
    return creep.getActiveBodyparts(WORK) > 0;
  }
}

export const minionCanWork = new MinionCanWork();
