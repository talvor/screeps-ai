export enum TaskActionType {
  BUILD = "BUILD",
  HARVEST = "HARVEST",
  MOVE = "MOVE",
  TRANSFER = "TRANSFER",
  UPGRADE = "UPGRADE"
}
type EmojiRecord = Record<keyof typeof TaskActionType, any>;
export const TaskActionEmoji: EmojiRecord = {
  BUILD: "🛠️",
  HARVEST: "⛏️",
  MOVE: "🚶",
  TRANSFER: "🔀",
  UPGRADE: "⬆️"
};
export enum TaskPrerequisiteType {
  CAN_CARRY = "CAN_CARRY",
  CAN_MOVE = "CAN_MOVE",
  CAN_WORK = "CAN_WORK",
  HAS_ENERGY = "HAS_ENERGY",
  IS_NEAR = "IS_NEAR"
}
export interface TaskAction {
  type: TaskActionType;
  target: Id<_HasId> | string;
  params?: Record<string, unknown>;
  prereqs: Array<TaskPrerequisite>;
}
export interface TaskPrerequisite {
  type: TaskPrerequisiteType;
  target?: Id<_HasId> | string;
  params?: Record<string, unknown>;
}

export interface TaskRequest {
  name: string;
  task: Task;
  status: "PENDING" | "INPROCESS" | "COMPLETE";
  roomName: string;
  repeatable?: boolean;
  minionParts?: Array<BodyPartConstant>;
  assignedCreep?: Id<Creep>;
}

export interface Task {
  type: TaskActionType;
  action: TaskAction;
  actionStack: Array<TaskAction>;
}

export abstract class BaseTaskAction<Target, Params> {
  abstract type: TaskActionType;
  abstract action(creep: Creep, taskAction: TaskAction): boolean;

  make(_target: Target, _params?: Params): TaskAction {
    throw new Error(`TaskAction ${this.type} must implement "make"`);
  }
}

export abstract class BaseTaskPrerequisite<Target, Params> {
  abstract type: TaskPrerequisiteType;

  abstract meets(creep: Creep, tp: TaskPrerequisite): boolean;

  toMeet(_creep: Creep, _tp: TaskPrerequisite): Array<TaskAction> {
    return [];
  }

  make(_target?: Target, _params?: Params): TaskPrerequisite {
    return {
      type: this.type
    };
  }
}

declare global {
  interface Memory {
    taskRequests: Array<TaskRequest>;
  }

  interface CreepMemory {
    taskRequest?: TaskRequest;
  }
}
