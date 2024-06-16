import { roomSupervisor } from "Supervisors/room";
import { spawnerSupervisor } from "Supervisors/spawner";
import { taskSupervisor } from "Supervisors/task";
import { preTick, reconcileTraffic } from "screeps-cartographer";
import { taskManager } from "task-manager";
import { cleanUpCreeps } from "utils/cleanUpCreeps";

class GameController {
  run() {
    taskManager.run(
      [
        { name: "preTick", fn: preTick, mandatory: true }, // must run first

        { name: "cleanUpCreeps", fn: cleanUpCreeps, runEvery: 1000 },

        { name: "runRoom", fn: roomSupervisor.runRoom.bind(roomSupervisor), mandatory: true },

        { name: "runScheduleTasks", fn: taskSupervisor.runScheduleTasks.bind(taskSupervisor), mandatory: true },
        { name: "runAllocatedTasks", fn: taskSupervisor.runAllocatedTasks.bind(taskSupervisor), mandatory: true },
        { name: "cleanUpTasks", fn: taskSupervisor.cleanUpTasks.bind(taskSupervisor), mandatory: true },

        { name: "runSpawner", fn: spawnerSupervisor.runSpawner.bind(spawnerSupervisor), runEvery: 1000 },

        // { name: "cleanMissions", fn: cleanMissions },
        // { name: "displayBucket", fn: displayBucket },
        // { name: "displayGcl", fn: displayGcl },
        // { name: "displayGpl", fn: displayGpl },
        // { name: "displaySpawn", fn: displaySpawn },
        // { name: "runScheduled", fn: runScheduled, mandatory: true },
        // { name: "runIntel", fn: runIntel, mandatory: true },
        // { name: "runStructures", fn: runStructures, mandatory: true },
        // { name: "planRooms", fn: planRooms, threshold: 5000 },
        // { name: "recordMetrics", fn: recordMetrics },
        // { name: "purgeOrphanedMissions", fn: purgeOrphanedMissions },
        // { name: "runReports", fn: runReports, mandatory: true },

        // { name: "runMissionControl", fn: runMissionControl, mandatory: true },
        { name: "reconcileTraffic", fn: reconcileTraffic, mandatory: true } // must run after missions
        // { name: "initializeSpawn", fn: initializeSpawn, mandatory: true },
        // { name: "recordOverhead", fn: recordOverhead, mandatory: true } // must run last
      ],
      Game.cpu.limit * 0.4,
      false
    );
  }
}

export const gameController = new GameController();
