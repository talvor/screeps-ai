import { findBusyCreeps } from "Selectors/creeps";
import { buildAction } from "Tasks/Actions/build";
import { harvestAction } from "Tasks/Actions/harvest";
import { mineAction } from "Tasks/Actions/mine";
import { moveAction } from "Tasks/Actions/move";
import { transferAction } from "Tasks/Actions/transfer";
import { upgradeAction } from "Tasks/Actions/upgrade";
import { minionCanCarry } from "Tasks/Prerequisites/minion-can-carry";
import { minionCanMove } from "Tasks/Prerequisites/minion-can-move";
import { minionCanWork } from "Tasks/Prerequisites/minion-can-work";
import { minionHasEnergy } from "Tasks/Prerequisites/minion-has-energy";
import { minionIsNear } from "Tasks/Prerequisites/minion-is-near";
import { minionIsOn } from "Tasks/Prerequisites/minion-is-on";
import {
  BaseTaskAction,
  BaseTaskPrerequisite,
  TaskAction,
  TaskActionEmoji,
  TaskActionType,
  TaskPrerequisite,
  TaskPrerequisiteType,
  TaskRequest
} from "Tasks/task";
import { uuid } from "utils/uuid";

declare global {
  interface Memory {
    taskRequests: Array<TaskRequest>;
  }

  interface CreepMemory {
    taskRequest?: TaskRequest;
  }
}
export type NewTaskRequest = Omit<TaskRequest, "id">;

class TaskSupervisor {
  requestNewTask(taskRequest: NewTaskRequest) {
    const newTaskRequest = { id: uuid.v4(), ...taskRequest };
    if (Memory.taskRequests.findIndex(tr => tr.name === newTaskRequest.name) === -1) {
      console.log(`TaskSupervisor: scheduling task ${newTaskRequest.name}`);
      Memory.taskRequests.push(newTaskRequest);
    }
  }

  runTaskScheduler() {
    const pendingTasks = Memory.taskRequests
      .filter(tr => tr.status === "PENDING")
      .sort((tr1, tr2) => tr2.priority - tr1.priority);

    pendingTasks.forEach(tr => {
      const creeps = Object.values(Game.creeps);
      for (const creep of creeps) {
        if (!creep.memory.busy && !creep.spawning) {
          const actionStack: Array<TaskAction> = [];
          const meets = this.doesCreepMeetPrerequisites(creep, tr.task.action, actionStack);
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

  runCreepTasks() {
    const busyCreeps = findBusyCreeps();
    for (const creep of busyCreeps) {
      const taskRequest = creep.memory.taskRequest;
      if (!taskRequest) {
        creep.memory.busy = false;
        return;
      }

      const task = taskRequest.task;

      const taskHandler = this.getTaskActionHander(task.action);

      // If this is a sticky task, ensure we have loaded the actions
      if (task.actionStack.length === 0 && taskRequest.sticky) {
        const actionStack: Array<TaskAction> = [];
        const meets = this.doesCreepMeetPrerequisites(creep, task.action, actionStack);
        actionStack.push(task.action);
        task.actionStack = actionStack;
      }

      if (task.actionStack.length > 0 && creep) {
        const action = task.actionStack.shift();
        if (action) {
          const handler = this.getTaskActionHander(action);

          // creep.say(`${TaskActionEmoji[action.type]} ${action.type}`);
          if (!handler.action(creep, action)) {
            task.actionStack.unshift(action);
          }
        }
        if (task.actionStack.length === 0) {
          if (taskRequest.sticky) {
            const actionStack: Array<TaskAction> = [];
            const meets = this.doesCreepMeetPrerequisites(creep, task.action, actionStack);
            if (meets) {
              actionStack.push(task.action);
              task.actionStack = actionStack;
            } else {
              creep.memory.busy = false;
              creep.memory.taskRequest = undefined;
            }
            continue;
          }

          if (taskRequest.repeatable) {
            let isRepeatableComplete = false;
            if (taskHandler.isRepeatableComplete) {
              isRepeatableComplete = taskHandler.isRepeatableComplete(creep, task.action);
            }
            taskRequest.status = isRepeatableComplete ? "COMPLETE" : "PENDING";
          } else {
            taskRequest.status = "COMPLETE";
          }

          taskRequest.assignedCreep = undefined;
          creep.memory.busy = false;
          creep.memory.taskRequest = undefined;
        }
      }

      // Sync task request status to task register
      const tr = Memory.taskRequests.find(req => req.id === taskRequest.id);
      if (tr) {
        tr.status = taskRequest.status;
        tr.assignedCreep = taskRequest.assignedCreep;
      }
    }
  }

  cleanUpTasks() {
    Memory.taskRequests
      .filter(tr => tr.status === "INPROCESS")
      .forEach(tr => {
        if (tr.assignedCreep && !Game.getObjectById(tr.assignedCreep)) {
          console.log(`TaskSupervisor: taskRequest ${tr.name} assigned creep is missing`);
          tr.assignedCreep = undefined;
          tr.status = "PENDING";
        }
      });
    Memory.taskRequests = Memory.taskRequests.filter(tr => tr.status !== "COMPLETE");
  }

  findRequests(room: Room, filterFn?: (request: TaskRequest) => boolean): Array<TaskRequest> {
    return Memory.taskRequests.filter(request => {
      if (request.roomName !== room.name) return false;
      if (filterFn) return filterFn(request);
      return true;
    });
  }
  private doesCreepMeetPrerequisites(creep: Creep, action: TaskAction, actionStack: TaskAction[]): boolean {
    let meets = true;
    //
    for (const tp of action.prereqs) {
      const handler = this.getTaskPrerequisiteHandler(tp);

      let tpMeets = handler.meets(creep, tp);
      if (!tpMeets) {
        for (const ta of handler.toMeet(creep, tp)) {
          const taMeets = this.doesCreepMeetPrerequisites(creep, ta, actionStack);
          if (taMeets) actionStack.push(ta);
          tpMeets = taMeets;

          if (!tpMeets) break;
        }
      }
      meets = meets && tpMeets;
      // if (!meets) break;
    }
    return meets;
  }
  private getTaskPrerequisiteHandler(tp: TaskPrerequisite): BaseTaskPrerequisite<unknown, unknown> {
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

      case TaskPrerequisiteType.IS_ON:
        return minionIsOn;

      default:
        throw new Error(`TaskPrerequisite handler for ${tp.type} not found`);
    }
  }
  private getTaskActionHander(ta: TaskAction): BaseTaskAction<unknown, unknown> {
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

      default:
        throw new Error(`TaskAction handler for ${ta.type} not found`);
    }
  }
}

export const taskSupervisor = new TaskSupervisor();
