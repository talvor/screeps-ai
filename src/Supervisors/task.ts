import { findBusyCreeps } from "Selectors/creeps";
import { NewTaskRequest, TaskRequest } from "Task/Tasks/task";
import { getTaskHandler } from "Task/Tasks/utils";
import { uuid } from "utils/uuid";

declare global {
  interface Memory {
    taskRequests: Array<TaskRequest>;
  }

  interface CreepMemory {
    taskRequests?: Array<TaskRequest>;
    currentTaskName?: string;
    currentActionName?: string;
  }
}
class TaskSupervisor {
  requestNewTask(newTaskRequest: NewTaskRequest): boolean {
    const taskRequest: TaskRequest = {
      id: uuid.v4(),
      currentTask: 0,
      status: "PENDING",
      assignedCreep: undefined,
      ...newTaskRequest
    };
    if (Memory.taskRequests.findIndex(tr => tr.name === newTaskRequest.name) === -1) {
      // console.log(`TaskSupervisor: scheduling task ${newTaskRequest.name}`);
      Memory.taskRequests.push(taskRequest);
      return true;
    }

    return false;
  }

  runTaskScheduler() {
    const pendingTasks = Memory.taskRequests
      .filter(tr => tr.status === "PENDING")
      .sort((tr1, tr2) => tr1.priority - tr2.priority);

    pendingTasks.forEach(tr => {
      const creeps = Object.values(Game.creeps);
      for (const creep of creeps) {
        if (!creep.memory.busy && !creep.spawning) {
          const meets = tr.tasks.reduce((pv, task) => {
            const taskHandler = getTaskHandler(task);
            return pv && taskHandler.checkCreepMeetsPrerequisites(creep);
          }, true);

          if (meets) {
            console.log(`TaskSupervisor: task request ${tr.name} allocated to ${creep.name}`);
            creep.memory.busy = true;
            creep.memory.taskRequests ??= [];
            creep.memory.taskRequests.push(tr);
            tr.assignedCreep = creep.id;
            tr.status = "INPROCESS";
            break;
          }
        }
      }
    });
  }

  runCreepTasks() {
    const busyCreeps = findBusyCreeps();
    for (const creep of busyCreeps) {
      creep.memory.taskRequests ??= [];
      creep.memory.taskRequests = creep.memory.taskRequests?.filter(tr => tr.status !== "COMPLETE");

      const taskRequest = creep.memory.taskRequests[0];
      if (!taskRequest) {
        creep.memory.busy = false;
        continue;
      }

      if (taskRequest.status === "PENDING") taskRequest.status = "INPROCESS";

      if (taskRequest.tasks.length === 0) {
        // No tasks left, so complete the request
        this.completeTaskRequest(creep, taskRequest);
        continue;
      }

      if (taskRequest.type !== creep.memory.currentTaskName) {
        creep.memory.currentTaskName = taskRequest.type;
      }

      if (taskRequest.currentTask >= taskRequest.tasks.length) {
        // Completed all the tasks, need to check if the request should be repeated
        if (taskRequest.repeatable) {
          // Reset the currentTask to beginning
          taskRequest.currentTask = 0;
        }
      }
      const task = taskRequest.tasks[taskRequest.currentTask];
      if (!task) {
        taskRequest.status = "COMPLETE";
        this.completeTaskRequest(creep, taskRequest);
        continue;
      }

      const taskHandler = getTaskHandler(task);
      if (taskHandler.execute(creep, task)) {
        taskRequest.currentTask++;
      }
    }
  }

  completeTaskRequest(creep: Creep, taskRequest: TaskRequest) {
    taskRequest.status === "COMPLETE";
    taskRequest.assignedCreep = undefined;
    creep.memory.taskRequests = creep.memory.taskRequests?.filter(tr => tr.id !== taskRequest.id);
    this.syncTaskRequest(taskRequest);
  }

  syncTaskRequest(taskRequest: TaskRequest) {
    // Sync task request status to task register
    const tr = Memory.taskRequests.find(req => req.id === taskRequest.id);
    if (tr) {
      tr.status = taskRequest.status;
      tr.assignedCreep = taskRequest.assignedCreep;
    }
  }

  cleanUpTasks() {
    Memory.taskRequests
      .filter(tr => tr.status === "INPROCESS")
      .forEach(tr => {
        if (tr.assignedCreep && !Game.getObjectById(tr.assignedCreep)) {
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
}

export const taskSupervisor = new TaskSupervisor();
