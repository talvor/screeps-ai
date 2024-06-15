import { TaskActionType, TaskRequest } from "Tasks/task";
import { upgradeAction } from "./Actions/upgrade";

export const makeUpgradeTask = (target: StructureController, idx: number): TaskRequest => ({
  name: `Upgrade: controller_${target.room.name}#${idx}`,
  task: {
    type: TaskActionType.UPGRADE,
    action: upgradeAction.make(target),
    actionStack: []
  },
  roomName: target.room.name,
  status: "PENDING",
  minionParts: [WORK, MOVE, CARRY]
});
