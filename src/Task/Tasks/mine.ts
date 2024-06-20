import { BaseTask, NewTaskRequest, Task, TaskType } from "Task/task";
import { MineActionParams, mineAction } from "Task/Actions/mine";

class MineTask extends BaseTask<Source, MineActionParams> {
  prerequisite: BodyPartConstant[] = [MOVE, CARRY, WORK];

  make(target: Source, params: MineActionParams): Task {
    return {
      type: TaskType.BUILD,
      target: target.id,
      actions: [mineAction.make(target, params)],
      currentAction: 0
    };
  }

  makeRequest(target: Source, params: MineActionParams): NewTaskRequest {
    return {
      type: TaskType.MINE,
      name: `Mine: ${target.id} `,
      tasks: [this.make(target, params)],
      roomName: target.room.name,
      priority: 1,
      repeatable: true
    };
  }
}

export const mineTask = new MineTask();
