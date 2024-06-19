import { TaskActionType } from "Tasks/task";
import { NewTaskRequest } from "Supervisors/task";
import { mineAction } from "./Actions/mine";

export const makeMineTask = (target: Source, destination: RoomPosition, distance: number): NewTaskRequest => ({
  name: `Mine: ${target.id}`,
  task: {
    type: TaskActionType.MINE,
    action: mineAction.make(target, { pos: destination, distance }),
    actionStack: []
  },
  roomName: target.room.name,
  status: "PENDING",
  priority: 0,
  minionParts: [MOVE, WORK, WORK, WORK, WORK]
});
