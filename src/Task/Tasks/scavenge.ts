import { BaseTask, NewTaskRequest, Task, TaskType } from "Task/Tasks/task";
import { scavengeAction } from "Task/Actions/scavenge";
import { depositAction } from "Task/Actions/deposit";

class ScavengeTask extends BaseTask<Room, undefined> {
  prerequisite: BodyPartConstant[] = [WORK, CARRY, MOVE];
  make(): Task {
    return {
      type: TaskType.SCAVENGE,
      target: "",
      actions: [scavengeAction.make(), depositAction.make()],
      currentAction: 0
    };
  }
  makeRequest(room: Room): NewTaskRequest {
    return {
      type: TaskType.SCAVENGE,
      name: `Scavenge: ${Game.time}`,
      tasks: [this.make()],
      roomName: room.name,
      priority: 0,
      repeatable: true
    };
  }
}

export const scavengeTask = new ScavengeTask();
