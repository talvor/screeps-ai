import { getTaskActionHander } from "./utils";

export enum TaskActionType {
  BUILD = "BUILD",
  HARVEST = "HARVEST",
  MINE = "MINE",
  MOVE = "MOVE",
  TRANSFER = "TRANSFER",
  UPGRADE = "UPGRADE",
  REPAIR = "REPAIR",
  SUICIDE = "SUICIDE"
}
type EmojiRecord = Record<keyof typeof TaskActionType, any>;
export const TaskActionEmoji: EmojiRecord = {
  BUILD: "🛠️",
  HARVEST: "⛏️",
  MINE: "⛏️",
  MOVE: "🚶",
  TRANSFER: "🔀",
  UPGRADE: "⬆️",
  REPAIR: "🪛",
  SUICIDE: "💀"
};

export interface TaskAction {
  type: TaskActionType;
  target: Id<_HasId> | string | undefined;
  params?: Record<string, unknown>;
  moveAction?: TaskAction;
}

export enum TaskType {
  BUILD = "BUILD",
  MINE = "MINE",
  RECHARGE = "RECHARGE",
  REPAIR = "REPAIR",
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

  shouldRepeatTask(_creep: Creep, _task: Task): boolean {
    return false;
  }
}

export abstract class BaseTaskAction<Target, Params> {
  abstract type: TaskActionType;
  abstract action(creep: Creep, taskAction: TaskAction): boolean;

  abstract make(_target: Target, _params?: Params): TaskAction;

  shouldRepeatAction(_creep: Creep, _ta: TaskAction): boolean {
    return false;
  }
}
