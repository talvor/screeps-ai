import { NewTaskRequest } from "Supervisors/task";
import { TransferTarget, transferAction } from "Tasks/Actions/transfer";
import { TaskActionType } from "Tasks/task";

export const makeRechargeTask = (target: TransferTarget): NewTaskRequest => ({
  name: `Recharge: ${target.structureType}_${target.id} `,
  task: {
    type: TaskActionType.TRANSFER,
    action: transferAction.make(target),
    actionStack: []
  },
  roomName: target.room.name,
  status: "PENDING",
  priority: 10,
  minionParts: [WORK, MOVE, CARRY]
});
