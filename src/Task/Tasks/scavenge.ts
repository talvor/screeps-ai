import { BaseTask, NewTaskRequest, Task, TaskType } from "Task/task";
import { scavengeAction } from "Task/Actions/scavenge";
import { dropAction } from "Task/Actions/drop";

class ScavengeTask extends BaseTask<StructureSpawn, undefined> {
  prerequisite: BodyPartConstant[] = [WORK, CARRY, MOVE];
  make(target: StructureSpawn): Task {
    return {
      type: TaskType.SCAVENGE,
      target: target.id,
      actions: [scavengeAction.make(), dropAction.make(target)],
      currentAction: 0
    };
  }
  makeRequest(target: StructureSpawn): NewTaskRequest {
    return {
      type: TaskType.SCAVENGE,
      name: `Scavenge: ${Game.time}`,
      tasks: [this.make(target)],
      roomName: target.room.name,
      priority: 0,
      repeatable: true
    };
  }
}

export const scavengeTask = new ScavengeTask();
