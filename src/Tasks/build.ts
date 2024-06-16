import { TaskActionType, TaskRequest } from "Tasks/task";
import { buildAction } from "./Actions/build";

export const makeBuildTask = (target: ConstructionSite, roomName: string): TaskRequest => ({
  name: `Build: ${target.id}`,
  task: {
    type: TaskActionType.BUILD,
    action: buildAction.make(target),
    actionStack: []
  },
  roomName: roomName,
  status: "PENDING",
  repeatable: true,
  minionParts: [WORK, MOVE, CARRY]
});
