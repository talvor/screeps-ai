import { BaseTask, NewTaskRequest, Task, TaskType } from "Task/task";
import { TransferTarget, transferAction } from "Task/Actions/transfer";
import { harvestAction } from "Task/Actions/harvest";

class RechargeTask extends BaseTask<TransferTarget, undefined> {
  prerequisite: BodyPartConstant[] = [MOVE, CARRY, WORK];
  make(target: TransferTarget): Task {
    return {
      type: TaskType.RECHARGE,
      target: target.id,
      actions: [harvestAction.make(), transferAction.make(target)],
      currentAction: 0
    };
  }

  makeRequest(target: TransferTarget): NewTaskRequest {
    return {
      type: TaskType.RECHARGE,
      name: `Recharge: ${target.structureType}_${target.id} `,
      tasks: [this.make(target)],
      roomName: target.room.name,
      priority: 1,
      repeatable: false
    };
  }
}

export const rechargeTask = new RechargeTask();
