import { BaseTask, NewTaskRequest, Task, TaskType } from "Task/task";
import { dropAction } from "Task/Actions/drop";
import { withdrawAction } from "Task/Actions/withdraw";
import { findSpawnsInRoom } from "Selectors/spawns";

class HaulTask extends BaseTask<StructureContainer, undefined> {
  prerequisite: BodyPartConstant[] = [CARRY, MOVE];
  make(target: StructureContainer): Task {
    const spawn = findSpawnsInRoom(target.room.name)[0];

    return {
      type: TaskType.HAUL,
      target: target.id,
      actions: [withdrawAction.make(target), dropAction.make(spawn)],
      currentAction: 0
    };
  }
  makeRequest(target: StructureContainer): NewTaskRequest {
    return {
      type: TaskType.HAUL,
      name: `Haul: ${target.id}`,
      tasks: [this.make(target)],
      roomName: target.room.name,
      priority: 0,
      repeatable: true
    };
  }
  shouldRepeatTask(_creep: Creep, _task: Task): boolean {
    return true;
  }
}

export const haulTask = new HaulTask();
