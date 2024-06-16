import { buildAction } from "Tasks/Actions/build";
import { harvestAction } from "Tasks/Actions/harvest";
import { moveAction } from "Tasks/Actions/move";
import { transferAction } from "Tasks/Actions/transfer";
import { upgradeAction } from "Tasks/Actions/upgrade";
import { minionCanCarry } from "Tasks/Prerequisites/minion-can-carry";
import { minionCanMove } from "Tasks/Prerequisites/minion-can-move";
import { minionCanWork } from "Tasks/Prerequisites/minion-can-work";
import { minionHasEnergy } from "Tasks/Prerequisites/minion-has-energy";
import { minionIsNear } from "Tasks/Prerequisites/minion-is-near";
import {
  BaseTaskAction,
  BaseTaskPrerequisite,
  Task,
  TaskAction,
  TaskActionEmoji,
  TaskActionType,
  TaskPrerequisite,
  TaskPrerequisiteType,
  TaskRequest
} from "Tasks/task";

if (!Memory.taskRequests) Memory.taskRequests = [];

class TaskSupervisor {
  requestNewTask(newTR: TaskRequest) {
    if (Memory.taskRequests.findIndex(tr => tr.name === newTR.name) === -1) {
      Memory.taskRequests.push(newTR);
    }
  }

  runScheduleTasks() {
    const pendingTasks = Memory.taskRequests.filter(tr => tr.status === "PENDING");

    pendingTasks.forEach(tr => {
      const creeps = Object.values(Game.creeps);
      for (const creep of creeps) {
        if (!creep.memory.busy && !creep.spawning) {
          const actionStack: Array<TaskAction> = [];
          const meets = doesCreepMeetPrerequisites(creep, tr.task.action, actionStack);
          if (meets) {
            actionStack.push(tr.task.action);
            creep.memory.busy = true;
            creep.memory.taskRequest = tr;
            tr.task.actionStack = actionStack;
            tr.assignedCreep = creep.id;
            tr.status = "INPROCESS";
          }
        }
      }
    });
  }

  runAllocatedTasks() {
    const inProcessTasks = Memory.taskRequests.filter(tr => tr.status === "INPROCESS");
    for (const tr of inProcessTasks) {
      const task = tr.task;
      if (!tr.assignedCreep) {
        continue;
      }
      const creep = Game.getObjectById(tr.assignedCreep);
      if (!creep) {
        tr.status = "COMPLETE";
        continue;
      }
      const taskHandler = getTaskActionHander(task.action);

      if (task.actionStack.length > 0 && creep) {
        const action = task.actionStack.shift();
        if (action) {
          const handler = getTaskActionHander(action);

          creep.say(`${TaskActionEmoji[action.type]} ${action.type}`);
          if (!handler.action(creep, action)) {
            task.actionStack.unshift(action);
          }
        }
        if (task.actionStack.length === 0) {
          if (tr.repeatable) {
            let isRepeatableComplete = false;
            if (taskHandler.isRepeatableComplete) {
              isRepeatableComplete = taskHandler.isRepeatableComplete(creep, task.action);
            }
            tr.status = isRepeatableComplete ? "COMPLETE" : "PENDING";
          } else {
            tr.status = "COMPLETE";
          }
          tr.assignedCreep = undefined;
          if (creep) {
            creep.memory.busy = false;
            creep.memory.taskRequest = undefined;
          }
        }
      }
    }
  }

  cleanUpTasks() {
    Memory.taskRequests = Memory.taskRequests.filter(tr => tr.status !== "COMPLETE");
  }
}

const doesCreepMeetPrerequisites = (creep: Creep, action: TaskAction, actionStack: TaskAction[]): boolean => {
  let meets = true;
  //
  for (const tp of action.prereqs) {
    const handler = getTaskPrerequisiteHandler(tp);

    let tpMeets = handler.meets(creep, tp);
    if (!tpMeets) {
      for (const ta of handler.toMeet(creep, tp)) {
        const taMeets = doesCreepMeetPrerequisites(creep, ta, actionStack);
        if (taMeets) actionStack.push(ta);
        tpMeets = taMeets;

        if (!tpMeets) break;
      }
    }
    meets = meets && tpMeets;
    // if (!meets) break;
  }
  return meets;
};

const getTaskPrerequisiteHandler = (tp: TaskPrerequisite): BaseTaskPrerequisite<unknown, unknown> => {
  switch (tp.type) {
    case TaskPrerequisiteType.HAS_ENERGY:
      return minionHasEnergy;

    case TaskPrerequisiteType.IS_NEAR:
      return minionIsNear;

    case TaskPrerequisiteType.CAN_WORK:
      return minionCanWork;

    case TaskPrerequisiteType.CAN_MOVE:
      return minionCanMove;

    case TaskPrerequisiteType.CAN_CARRY:
      return minionCanCarry;

    default:
      throw new Error(`TaskPrerequisite handler for ${tp.type} not found`);
  }
};

const getTaskActionHander = (ta: TaskAction): BaseTaskAction<unknown, unknown> => {
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

    default:
      throw new Error(`TaskAction handler for ${ta.type} not found`);
  }
};

export const taskSupervisor = new TaskSupervisor();
