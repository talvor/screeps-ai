import { taskSupervisor } from "./task";
import {
  findContainerNearSpawn,
  findFreeSpawnsInRoom,
  findSpawnsToRecharge,
  findStorageNearSpawn
} from "Selectors/spawns";
import {
  findConstructionSitesInRoom,
  findContainersNearPosition,
  findExtensionsInRoom,
  findStructuresNeedingRepair,
  findTowersInRoom
} from "Selectors/structure";
import { spawnSupervisor } from "./spawn";
import { TaskType } from "Task/Tasks/task";
import { countCreepsWithName } from "Selectors/creeps";
import { findSourcesInRoom } from "Selectors/room";
import { rechargeTask } from "Task/Tasks/recharge";
import { buildTask } from "Task/Tasks/build";
import { repairTask } from "Task/Tasks/repair";
import { mineTask } from "Task/Tasks/mine";
import { upgradeTask } from "Task/Tasks/upgrade";
import { haulTask } from "Task/Tasks/haul";
import { scavengeTask } from "Task/Tasks/scavenge";

const WORKERS_PCL = 2; // Workers per controller level
const TASKS_PER_TYPE_PCL = 3; // Build tasks per controller level
const UPGRADERS_PCL = 1;

class RoomSupervisor {
  runRoom() {
    const rooms = Object.values(Game.rooms);
    for (const room of rooms) {
      const controller = room.controller;
      if (controller && controller.my) {
        // Create spawn requests
        this.createWorkers(room);
        this.createMiners(room);
        this.createUpraders(room);
        this.createHaulers(room);
        this.createScavengers(room);

        // Create task requests
        this.createBuildRequests(room, controller);

        // Create recharge task for extensions that need energy
        findExtensionsInRoom(room, extension => {
          return extension.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }).forEach(extension => taskSupervisor.requestNewTask(rechargeTask.makeRequest(extension)));

        // Create recharge task for towers that need energy
        findTowersInRoom(room, tower => {
          return tower.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }).forEach(tower => taskSupervisor.requestNewTask(rechargeTask.makeRequest(tower)));
      }

      if (taskSupervisor.findRequests(room).length === 0 && room.controller) {
        // There are no tasks for the workers, so lets create an upgrade task each
        const workerCount = countCreepsWithName("Worker", room);
        console.log(`Creating ${workerCount} upgrade tasks`);
        for (let index = 0; index < workerCount; index++) {
          const upgradeRequest = upgradeTask.makeRequest(room.controller);
          upgradeRequest.repeatable = false;
          taskSupervisor.requestNewTask(upgradeRequest);
        }
      }
    }

    // Create a recharge task for each spawn that needs energy
    findSpawnsToRecharge().forEach(spawn => taskSupervisor.requestNewTask(rechargeTask.makeRequest(spawn)));
  }

  createBuildRequests(room: Room, controller: StructureController) {
    const TASKS_PER_CONSTRUCTION_SITE = 3;
    // Create a build task for each construction site in the room
    const buildRequests = taskSupervisor.findRequests(room, request => {
      return request.type === TaskType.BUILD;
    });

    if (buildRequests.length < controller.level * TASKS_PER_TYPE_PCL) {
      const constructionSites = findConstructionSitesInRoom(room).sort((a, b) => {
        return b.progress - a.progress;
      });
      for (const cs of constructionSites) {
        const requestCount = taskSupervisor.findRequests(
          room,
          tr => tr.type === TaskType.BUILD && tr.name.includes(cs.id)
        );
        if (requestCount.length < TASKS_PER_CONSTRUCTION_SITE) {
          if (taskSupervisor.requestNewTask(buildTask.makeRequest(cs))) break;
        }
      }
    }
  }

  createMiners(room: Room) {
    // Create miners
    const spawn = findFreeSpawnsInRoom(room.name);
    const sources = findSourcesInRoom(room);
    for (const source of sources) {
      const container = findContainersNearPosition(source.pos, 2)[0];
      if (!container) continue;
      if (countCreepsWithName(`Miner${source.id}`, room) === 0) {
        if (spawn) {
          const taskRequest = mineTask.makeRequest(source, { pos: container.pos, distance: 0 });
          spawnSupervisor.requestNewMinion({
            name: `Miner${source.id}`,
            spawnId: spawn.id,
            bodyParts: [MOVE, WORK, WORK, WORK, WORK],
            taskRequests: [taskRequest]
          });
          break;
        }
      }
    }
  }

  createHaulers(room: Room) {
    // Create Upgraders
    const spawn = findFreeSpawnsInRoom(room.name);
    if (!spawn) return;

    let destination: StructureContainer | StructureStorage | undefined = findStorageNearSpawn(spawn);
    if (!destination) {
      destination = findContainerNearSpawn(spawn);
    }
    if (!destination) return;

    const sources = findSourcesInRoom(room);
    for (const source of sources) {
      const container = findContainersNearPosition(source.pos, 2)[0];
      if (!container) continue;

      if (countCreepsWithName(`Hauler${container.id}`, room) < 1) {
        const taskRequest = haulTask.makeRequest(container, destination);
        spawnSupervisor.requestNewMinion({
          name: `Hauler${container.id}_${Game.time}`,
          spawnId: spawn.id,
          bodyParts: [MOVE, CARRY, CARRY, MOVE, CARRY],
          taskRequests: [taskRequest]
        });
        break;
      }
    }
  }

  createScavengers(room: Room) {
    const spawn = findFreeSpawnsInRoom(room.name);
    if (!spawn) return;
    const containerNearSpawn = findContainerNearSpawn(spawn);
    if (!containerNearSpawn) return;

    // Ensure we always have some workers
    const scavengerCount = countCreepsWithName("Scavenger", room);
    if (scavengerCount < 1) {
      const taskRequest = scavengeTask.makeRequest(room);
      spawnSupervisor.requestNewMinion({
        name: "Scavenger" + Game.time,
        spawnId: spawn.id,
        bodyParts: [WORK, CARRY, MOVE, CARRY, MOVE],
        taskRequests: [taskRequest]
      });
    }
  }
  createUpraders(room: Room) {
    // Create Upgraders
    const spawn = findFreeSpawnsInRoom(room.name);
    const controller = room.controller;
    const upgraderCount = countCreepsWithName("Upgrader", room);
    if (controller && upgraderCount < Math.max(2, controller.level * UPGRADERS_PCL)) {
      const taskRequest = upgradeTask.makeRequest(controller);
      if (spawn) {
        spawnSupervisor.requestNewMinion({
          name: "Upgrader" + Game.time,
          spawnId: spawn.id,
          bodyParts: [WORK, MOVE, CARRY, MOVE, CARRY],
          taskRequests: [taskRequest]
        });
      }
    }
  }

  createWorkers(room: Room) {
    const spawn = findFreeSpawnsInRoom(room.name);
    // Ensure we always have some workers
    const workerCount = countCreepsWithName("Worker", room);
    const requiredWorkers = (room.controller ? room.controller.level : 0) * WORKERS_PCL;

    if (workerCount < requiredWorkers) {
      if (spawn) {
        spawnSupervisor.requestNewMinion({
          name: "Worker" + Game.time,
          spawnId: spawn.id,
          bodyParts: [WORK, CARRY, MOVE, CARRY, MOVE]
        });
      }
    }
  }
}

export const roomSupervisor = new RoomSupervisor();
