import { TaskActionType } from "Tasks/task";
import { upgradeAction } from "./Actions/upgrade";
import { NewTaskRequest } from "Supervisors/task";

export const makeUpgradeTask = (target: StructureController, idx: number): NewTaskRequest => ({
  name: `Upgrade: controller_${target.room.name}#${idx}`,
  task: {
    type: TaskActionType.UPGRADE,
    action: upgradeAction.make(target),
    actionStack: []
  },
  roomName: target.room.name,
  status: "PENDING",
  priority: 0,
  minionParts: [WORK, MOVE, CARRY]
});
