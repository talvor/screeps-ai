import { TaskActionType } from "Tasks/task";
import { buildAction } from "./Actions/build";
import { NewTaskRequest } from "Supervisors/task";

export const makeBuildTask = (target: ConstructionSite, roomName: string): NewTaskRequest => ({
  name: `Build: ${target.id}`,
  task: {
    type: TaskActionType.BUILD,
    action: buildAction.make(target),
    actionStack: []
  },
  roomName: roomName,
  status: "PENDING",
  priority: 1,
  repeatable: true,
  minionParts: [WORK, MOVE, CARRY]
});
