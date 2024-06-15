import { transferAction } from "Tasks/Actions/transfer";
import { TaskActionType, TaskRequest } from "Tasks/task";

export const makeRechargeTask = (target: StructureSpawn): TaskRequest => ({
  name: `Recharge: ${target.name}`,
  task: {
    type: TaskActionType.TRANSFER,
    action: transferAction.make(target),
    actionStack: []
  },
  roomName: target.room.name,
  status: "PENDING",
  minionParts: [WORK, MOVE, CARRY]
});
