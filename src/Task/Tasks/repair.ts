import { harvestAction } from "Task/Actions/harvest";
import { repairAction } from "Task/Actions/repair";
import { BaseTask, NewTaskRequest, Task, TaskType } from "Task/Tasks/task";

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

  shouldRepeatTask(_creep: Creep, task: Task): boolean {
    const targetId = task.target as Id<Structure>;
    const target = Game.getObjectById(targetId);
    if (target) {
      console.log(`RepairTask: shouldRepeatTask ${target.hits}:${target.hitsMax}`);
      return target.hitsMax !== target.hits;
    }
    return false;
  }
}

export const repairTask = new RepairTask();
