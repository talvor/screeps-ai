import { BaseTaskPrerequisite, TaskPrerequisiteType } from "Tasks/task";

class MinionCanCarry extends BaseTaskPrerequisite<undefined, undefined> {
  type = TaskPrerequisiteType.CAN_CARRY;

  meets(creep: Creep) {
    return creep.getActiveBodyparts(CARRY) > 0;
  }
}

export const minionCanCarry = new MinionCanCarry();
