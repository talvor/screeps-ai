import { harvestAction } from "Task/Actions/harvest";
import { buildAction } from "Task/Actions/build";
import { BaseTask, NewTaskRequest, Task, TaskType } from "Task/Tasks/task";

class BuildTask extends BaseTask<ConstructionSite, undefined> {
  prerequisite: BodyPartConstant[] = [MOVE, CARRY, WORK];

  make(target: ConstructionSite): Task {
    return {
      type: TaskType.BUILD,
      target: target.id,
      actions: [harvestAction.make(), buildAction.make(target)],
      currentAction: 0
    };
  }

  makeRequest(target: ConstructionSite): NewTaskRequest {
    return {
      type: TaskType.BUILD,
      name: `Build: ${target.id}_${Game.time}`,
      tasks: [this.make(target)],
      roomName: target.room?.name || "unknown",
      priority: 10,
      repeatable: false
    };
  }
}

export const buildTask = new BuildTask();
