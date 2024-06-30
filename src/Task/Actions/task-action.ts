export interface TaskAction {
  type: TaskActionType;
  target: Id<_HasId> | string | undefined;
  params?: Record<string, unknown>;
  moveAction?: TaskAction;
}

export enum TaskActionType {
  BUILD = "BUILD",
  DEPOSIT = "DEPOSIT",
  DROP = "DROP",
  HARVEST = "HARVEST",
  MINE = "MINE",
  MOVE = "MOVE",
  TRANSFER = "TRANSFER",
  UPGRADE = "UPGRADE",
  SCAVENGE = "SCAVENGE",
  SUICIDE = "SUICIDE",
  WITHDRAW = "WITHDRAW"
}

type EmojiRecord = Record<keyof typeof TaskActionType, any>;
export const TaskActionEmoji: EmojiRecord = {
  BUILD: "🛠️",
  DEPOSIT: "⬇️",
  DROP: "⬇️",
  SCAVENGE: "♻️",
  HARVEST: "⛏️",
  MINE: "⛏️",
  MOVE: "🚶",
  TRANSFER: "🚚",
  UPGRADE: "🔧",
  SUICIDE: "☠️",
  WITHDRAW: "⬆️"
};

export abstract class BaseTaskAction<Target, Params> {
  abstract type: TaskActionType;
  abstract action(creep: Creep, taskAction: TaskAction): boolean;

  abstract make(_target: Target, _params?: Params): TaskAction;

  shouldRepeatAction(_creep: Creep, _ta: TaskAction): boolean {
    return false;
  }
}
