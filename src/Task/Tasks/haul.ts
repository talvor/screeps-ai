import { BaseTask, NewTaskRequest, Task, TaskType } from "Task/Tasks/task";
import { dropAction } from "Task/Actions/drop";
import { withdrawAction } from "Task/Actions/withdraw";
import { depositAction } from "Task/Actions/deposit";

type DestinationStructure = StructureStorage | StructureContainer;

class HaulTask extends BaseTask<StructureContainer, DestinationStructure> {
  prerequisite: BodyPartConstant[] = [CARRY, MOVE];
  make(target: StructureContainer, destination: DestinationStructure): Task {
    const task =
      destination.structureType === STRUCTURE_CONTAINER
        ? dropAction.make(destination.pos)
        : depositAction.make(destination);
    return {
      type: TaskType.HAUL,
      target: target.id,
      actions: [withdrawAction.make(target), task],
      currentAction: 0
    };
  }
  makeRequest(target: StructureContainer, destination: DestinationStructure): NewTaskRequest {
    return {
      type: TaskType.HAUL,
      name: `Haul: ${target.id} -> ${destination.id}`,
      tasks: [this.make(target, destination)],
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
