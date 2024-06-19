export enum TaskActionType {
  BUILD = "BUILD",
  HARVEST = "HARVEST",
  MINE = "MINE",
  MOVE = "MOVE",
  TRANSFER = "TRANSFER",
  UPGRADE = "UPGRADE"
}
type EmojiRecord = Record<keyof typeof TaskActionType, any>;
export const TaskActionEmoji: EmojiRecord = {
  BUILD: "🛠️",
  HARVEST: "⛏️",
  MINE: "⛏️",
  MOVE: "🚶",
  TRANSFER: "🔀",
  UPGRADE: "⬆️"
};
export enum TaskPrerequisiteType {
  CAN_CARRY = "CAN_CARRY",
  CAN_MOVE = "CAN_MOVE",
  CAN_WORK = "CAN_WORK",
  HAS_ENERGY = "HAS_ENERGY",
  IS_NEAR = "IS_NEAR",
  IS_ON = "IS_ON"
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
  id: string;
  name: string;
  task: Task;
  status: "PENDING" | "INPROCESS" | "COMPLETE";
  roomName: string;
  priority: number;
  repeatable?: boolean;
  minionParts?: Array<BodyPartConstant>;
  assignedCreep?: Id<Creep>;
  sticky?: boolean; // Sticks to the assigned creep when complete
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
  isRepeatableComplete(_creep: Creep, _ta: TaskAction): boolean {
    return true;
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
