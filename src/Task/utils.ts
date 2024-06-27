import { buildAction } from "./Actions/build";
import { dropAction } from "./Actions/drop";
import { harvestAction } from "./Actions/harvest";
import { mineAction } from "./Actions/mine";
import { moveAction } from "./Actions/move";
import { repairAction } from "./Actions/repair";
import { scavengeAction } from "./Actions/scavenge";
import { suicideAction } from "./Actions/suicide";
import { transferAction } from "./Actions/transfer";
import { upgradeAction } from "./Actions/upgrade";
import { withdrawAction } from "./Actions/withdraw";
import { buildTask } from "./Tasks/build";
import { haulTask } from "./Tasks/haul";
import { mineTask } from "./Tasks/mine";
import { rechargeTask } from "./Tasks/recharge";
import { repairTask } from "./Tasks/repair";
import { scavengeTask } from "./Tasks/scavenge";
import { suicideTask } from "./Tasks/suicide";
import { upgradeTask } from "./Tasks/upgrade";
import { BaseTask, BaseTaskAction, Task, TaskAction, TaskActionType, TaskRequest, TaskType } from "./task";

export const getTaskHandler = (t: Task | TaskRequest): BaseTask<unknown, unknown> => {
  switch (t.type) {
    case TaskType.BUILD:
      return buildTask;

    case TaskType.HAUL:
      return haulTask;

    case TaskType.MINE:
      return mineTask;

    case TaskType.RECHARGE:
      return rechargeTask;

    case TaskType.REPAIR:
      return repairTask;

    case TaskType.SUICIDE:
      return suicideTask;

    case TaskType.UPGRADE:
      return upgradeTask;

    case TaskType.SCAVENGE:
      return scavengeTask;

    default:
      throw new Error(`Task handler for ${t.type} not found`);
  }
};

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
