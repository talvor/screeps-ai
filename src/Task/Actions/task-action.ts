export interface TaskAction {
  type: TaskActionType;
  target: Id<_HasId> | string | undefined;
  params?: Record<string, unknown>;
  moveAction?: TaskAction;
}

export enum TaskActionType {
  BUILD = "BUILD",
  DROP = "DROP",
  HARVEST = "HARVEST",
  MINE = "MINE",
  MOVE = "MOVE",
  TRANSFER = "TRANSFER",
  UPGRADE = "UPGRADE",
  REPAIR = "REPAIR",
  SCAVENGE = "SCAVENGE",
  SUICIDE = "SUICIDE",
  WITHDRAW = "WITHDRAW"
}

export abstract class BaseTaskAction<Target, Params> {
  abstract type: TaskActionType;
  abstract action(creep: Creep, taskAction: TaskAction): boolean;

  abstract make(_target: Target, _params?: Params): TaskAction;

  shouldRepeatAction(_creep: Creep, _ta: TaskAction): boolean {
    return false;
  }
}
