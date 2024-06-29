import { suicideAction } from "Task/Actions/suicide";
import { BaseTask, NewTaskRequest, Task, TaskType } from "Task/Tasks/task";

class SuicideTask extends BaseTask<undefined, undefined> {
  prerequisite: BodyPartConstant[] = [];

  make(): Task {
    return {
      type: TaskType.SUICIDE,
      target: undefined,
      actions: [suicideAction.make()],
      currentAction: 0
    };
  }

  makeRequest(): NewTaskRequest {
    return {
      type: TaskType.SUICIDE,
      name: "Suicide",
      tasks: [this.make()],
      roomName: "unknown",
      priority: 0,
      repeatable: false
    };
  }
}

export const suicideTask = new SuicideTask();
