import { runIntel } from "Intel";
import { runScheduled } from "Selectors/scheduledCallbacks";
import { creepSupervisor } from "Supervisors/creep";
import { planningSupervisor } from "Supervisors/planning";
import { roomSupervisor } from "Supervisors/room";
import { spawnSupervisor } from "Supervisors/spawn";
import { taskSupervisor } from "Supervisors/task";
import { preTick, reconcileTraffic } from "screeps-cartographer";
import { taskManager } from "task-manager";
import { cleanUpCreeps } from "utils/cleanUpCreeps";

class GameController {
  run() {
    Memory.rooms ??= {};
    Memory.roomPlans ??= {};
    Memory.taskRequests ??= [];
    Memory.spawnRequests ??= [];
    Memory.positions ??= {};

    taskManager.run(
      [
        { name: "preTick", fn: preTick, mandatory: true }, // must run first
        { name: "runScheduled", fn: runScheduled, mandatory: true },
        { name: "runIntel", fn: runIntel, mandatory: true },
        { name: "runRoom", fn: roomSupervisor.runRoom.bind(roomSupervisor), mandatory: true },
        { name: "runTaskScheduler", fn: taskSupervisor.runTaskScheduler.bind(taskSupervisor), mandatory: true },
        { name: "runCreepTasks", fn: taskSupervisor.runCreepTasks.bind(taskSupervisor), mandatory: true },
        { name: "cleanUpTasks", fn: taskSupervisor.cleanUpTasks.bind(taskSupervisor), mandatory: true },
        { name: "runSpawner", fn: spawnSupervisor.runSpawner.bind(spawnSupervisor), runEvery: 10 },
        { name: "runCreepSupervisor", fn: creepSupervisor.runSupervisor.bind(creepSupervisor), runEvery: 10 },
        { name: "planRooms", fn: planningSupervisor.planRooms.bind(planningSupervisor.planRooms), threshold: 5000 },
        { name: "reconcileTraffic", fn: reconcileTraffic, mandatory: true }, // must run after missions
        { name: "cleanUpCreeps", fn: cleanUpCreeps, runEvery: 1000 }
      ],
      Game.cpu.limit * 0.4,
      false
    );
  }
}

export const gameController = new GameController();
