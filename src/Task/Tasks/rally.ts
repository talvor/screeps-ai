import { moveAction } from "Task/Actions/move";
import { BaseTask, NewTaskRequest, Task, TaskType } from "Task/Tasks/task";

class RallyTask extends BaseTask<Flag, undefined> {
  prerequisite: BodyPartConstant[] = [];

  make(flag: Flag): Task {
    return {
      type: TaskType.RALLY,
      target: undefined,
      actions: [moveAction.make(flag.pos, 3)],
      currentAction: 0
    };
  }

  makeRequest(flag: Flag): NewTaskRequest {
    return {
      type: TaskType.RALLY,
      name: "Rally",
      tasks: [this.make(flag)],
      roomName: "unknown",
      priority: 0,
      repeatable: false
    };
  }
}

export const rallyTask = new RallyTask();
