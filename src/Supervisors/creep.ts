import { findIdleCreeps } from "Selectors/creeps";
import { NewTaskRequest, TaskRequest } from "Task/Tasks/task";
import { rallyTask } from "Task/Tasks/rally";
import { uuid } from "utils/uuid";
import { upgradeTask } from "Task/Tasks/upgrade";

declare global {
  interface CreepMemory {
    idleTicks?: number;
  }
}
class CreepSupervisor {
  runSupervisor() {
    const idleCreeps = findIdleCreeps();
    for (const creep of idleCreeps) {
      creep.memory.idleTicks ??= 0;
      this.rallyCreep(creep);

      creep.memory.idleTicks++;
      if (creep.memory.idleTicks > 5) {
        creep.memory.taskRequests = [];
        if (creep.room.controller) {
          creep.memory.idleTicks = 0;
          const upgradeRequest = upgradeTask.makeRequest(creep.room.controller);
          upgradeRequest.repeatable = false;
          this.sendTaskToCreep(creep, upgradeRequest);
        }
      }
    }
  }
  rallyCreep(creep: Creep) {
    const rallyFlag = Game.flags["RallyPoint"];
    if (rallyFlag) {
      if (!creep.pos.inRangeTo(rallyFlag.pos, 2)) {
        this.sendTaskToCreep(creep, rallyTask.makeRequest(rallyFlag));
      }
    }
  }

  sendTaskToCreep(creep: Creep, newTaskRequest: NewTaskRequest) {
    if (creep.memory.busy) return;
    const tr: TaskRequest = {
      id: uuid.v4(),
      currentTask: 0,
      status: "PENDING",
      assignedCreep: undefined,
      ...newTaskRequest
    };
    creep.memory.busy = true;
    creep.memory.taskRequests ??= [];
    creep.memory.taskRequests.push(tr);
    tr.assignedCreep = creep.id;
    tr.status = "INPROCESS";
  }
}

export const creepSupervisor = new CreepSupervisor();
