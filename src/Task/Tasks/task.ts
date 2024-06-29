import { TaskAction, TaskActionEmoji } from "Task/Actions/task-action";
import { getTaskActionHander } from "Task/Actions/utils";

export enum TaskType {
  BUILD = "BUILD",
  HAUL = "HAUL",
  MINE = "MINE",
  RALLY = "RALLY",
  RECHARGE = "RECHARGE",
  REPAIR = "REPAIR",
  SCAVENGE = "SCAVENGE",
  SUICIDE = "SUICIDE",
  UPGRADE = "UPGRADE"
}

export interface Task {
  type: TaskType;
  target: Id<_HasId> | string | undefined;
  actions: Array<TaskAction>;
  currentAction: number;
}

export interface TaskRequest {
  type: TaskType;
  id: string;
  name: string;
  tasks: Array<Task>;
  currentTask: number;
  status: "PENDING" | "INPROCESS" | "COMPLETE";
  roomName: string;
  priority: number;
  repeatable: boolean;
  assignedCreep?: Id<Creep>;
}

export type NewTaskRequest = Pick<TaskRequest, "type" | "name" | "tasks" | "roomName" | "priority" | "repeatable">;

export abstract class BaseTask<Target, Params> {
  abstract prerequisite: Array<BodyPartConstant>;
  abstract make(target: Target, params: Params): Task;
  abstract makeRequest(target: Target, params: Params): NewTaskRequest;

  execute(creep: Creep, task: Task): boolean {
    if (task.actions.length === 0) return true;
    if (task.currentAction >= task.actions.length) task.currentAction = 0;

    const action = task.actions[task.currentAction];
    const actionHandler = getTaskActionHander(action);

    if (actionHandler.type !== creep.memory.currentActionName) {
      creep.memory.currentActionName = actionHandler.type;
      creep.say(`${creep.memory.currentTaskName}:${TaskActionEmoji[actionHandler.type]}`);
    }
    if (actionHandler.action(creep, action)) {
      task.currentAction++;
    }
    if (task.currentAction >= task.actions.length) {
      // Completed all actions, check if we should repeat task
      if (this.shouldRepeatTask(creep, task)) {
        // Reset task to beginning of action list.
        task.currentAction = 0;
      } else {
        // Task is complete
        return true;
      }
    }

    return false;
  }

  checkCreepMeetsPrerequisites(creep: Creep): boolean {
    return this.prerequisite.reduce((pv, bodyPart) => {
      return pv && creep.getActiveBodyparts(bodyPart) > 0;
    }, true);
  }

  shouldRepeatTask(_creep: Creep, task: Task): boolean {
    return false;
  }
}
