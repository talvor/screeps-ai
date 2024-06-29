import { buildTask } from "./build";
import { haulTask } from "./haul";
import { mineTask } from "./mine";
import { rechargeTask } from "./recharge";
import { repairTask } from "./repair";
import { scavengeTask } from "./scavenge";
import { suicideTask } from "./suicide";
import { upgradeTask } from "./upgrade";
import { BaseTask, Task, TaskRequest, TaskType } from "./task";
import { rallyTask } from "./rally";

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

    case TaskType.RALLY:
      return rallyTask;

    default:
      throw new Error(`Task handler for ${t.type} not found`);
  }
};
