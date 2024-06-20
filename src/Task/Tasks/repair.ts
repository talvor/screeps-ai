import { harvestAction } from "Task/Actions/harvest";
import { repairAction } from "Task/Actions/repair";
import { BaseTask, Task, NewTaskRequest, TaskType } from "Task/task";

class RepairTask extends BaseTask<Structure, undefined> {
  prerequisite: BodyPartConstant[] = [WORK, MOVE, CARRY];

  make(target: Structure<StructureConstant>): Task {
    return {
      type: TaskType.REPAIR,
      target: target.id,
      actions: [harvestAction.make(), repairAction.make(target)],
      currentAction: 0
    };
  }
  makeRequest(target: Structure<StructureConstant>): NewTaskRequest {
    return {
      type: TaskType.REPAIR,
      name: `Repair: ${target.id}`,
      tasks: [this.make(target)],
      roomName: target.room.name,
      priority: 1,
      repeatable: false
    };
  }
}

export const repairTask = new RepairTask();
