import { BaseTask, NewTaskRequest, Task, TaskType } from "Task/Tasks/task";
import { upgradeAction } from "Task/Actions/upgrade";
import { harvestAction } from "Task/Actions/harvest";

class UpgradeTask extends BaseTask<StructureController, undefined> {
  prerequisite: BodyPartConstant[] = [WORK, CARRY, MOVE];
  make(target: StructureController): Task {
    return {
      type: TaskType.UPGRADE,
      target: target.id,
      actions: [harvestAction.make(), upgradeAction.make(target)],
      currentAction: 0
    };
  }
  makeRequest(target: StructureController): NewTaskRequest {
    return {
      type: TaskType.UPGRADE,
      name: `Upgrade: controller_${target.room.name}`,
      tasks: [this.make(target)],
      roomName: target.room.name,
      priority: 5,
      repeatable: true
    };
  }
}

export const upgradeTask = new UpgradeTask();
