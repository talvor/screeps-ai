import { buildAction } from "./build";
import { dropAction } from "./drop";
import { harvestAction } from "./harvest";
import { mineAction } from "./mine";
import { moveAction } from "./move";
import { repairAction } from "./repair";
import { scavengeAction } from "./scavenge";
import { suicideAction } from "./suicide";
import { transferAction } from "./transfer";
import { upgradeAction } from "./upgrade";
import { withdrawAction } from "./withdraw";
import { TaskAction, TaskActionType, BaseTaskAction } from "./task-action";

export const getTaskActionHander = (ta: TaskAction): BaseTaskAction<unknown, unknown> => {
  switch (ta.type) {
    case TaskActionType.UPGRADE:
      return upgradeAction;

    case TaskActionType.TRANSFER:
      return transferAction;

    case TaskActionType.HARVEST:
      return harvestAction;

    case TaskActionType.MOVE:
      return moveAction;

    case TaskActionType.BUILD:
      return buildAction;

    case TaskActionType.MINE:
      return mineAction;

    case TaskActionType.SUICIDE:
      return suicideAction;

    case TaskActionType.REPAIR:
      return repairAction;

    case TaskActionType.WITHDRAW:
      return withdrawAction;

    case TaskActionType.DROP:
      return dropAction;

    case TaskActionType.SCAVENGE:
      return scavengeAction;

    default:
      throw new Error(`TaskAction handler for ${ta.type} not found`);
  }
};
