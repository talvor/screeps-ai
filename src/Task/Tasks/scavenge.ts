import { BaseTask, NewTaskRequest, Task, TaskType } from "Task/Tasks/task";
import { scavengeAction } from "Task/Actions/scavenge";
import { dropAction } from "Task/Actions/drop";

class ScavengeTask extends BaseTask<StructureContainer, undefined> {
  prerequisite: BodyPartConstant[] = [WORK, CARRY, MOVE];
  make(target: StructureContainer): Task {
    return {
      type: TaskType.SCAVENGE,
      target: target.id,
      actions: [scavengeAction.make(), dropAction.make(target.pos)],
      currentAction: 0
    };
  }
  makeRequest(target: StructureContainer): NewTaskRequest {
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
