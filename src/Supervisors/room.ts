import { taskSupervisor } from "./task";
import { findContainerNearSpawn, findFreeSpawnsInRoom, findSpawnsToRecharge } from "Selectors/spawns";
import {
  findConstructionSitesInRoom,
  findContainersNearPosition,
  findExtensionsInRoom,
  findStructuresNeedingRepair,
  findTowersInRoom
} from "Selectors/structure";
import { spawnSupervisor } from "./spawn";
import { TaskType } from "Task/task";
import { countCreepsWithName } from "Selectors/creeps";
import { findContainersInRoom, findSourcesInRoom } from "Selectors/room";
import { rechargeTask } from "Task/Tasks/recharge";
import { buildTask } from "Task/Tasks/build";
import { repairTask } from "Task/Tasks/repair";
import { suicideTask } from "Task/Tasks/suicide";
import { mineTask } from "Task/Tasks/mine";
import { upgradeTask } from "Task/Tasks/upgrade";
import { haulTask } from "Task/Tasks/haul";
import { scavengeTask } from "Task/Tasks/scavenge";

const WORKERS_PCL = 2; // Workers per controller level
const TASKS_PER_TYPE_PCL = 2; // Build tasks per controller level
const UPGRADERS_PCL = 2;

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
        // this.createRepairer(room);

        // Create task requests
        this.createBuildRequests(room, controller);
        // this.createRepairRequests(room);

        // Create recharge task for extensions that need energy
        findExtensionsInRoom(room, extension => {
          return extension.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }).forEach(extension => taskSupervisor.requestNewTask(rechargeTask.makeRequest(extension)));

        // Create recharge task for towers that need energy
        findTowersInRoom(room, tower => {
          return tower.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }).forEach(tower => taskSupervisor.requestNewTask(rechargeTask.makeRequest(tower)));
      }

      const repairStructures = findStructuresNeedingRepair(room, 0.9);
      if (repairStructures.length > 0) {
        // console.log(repairStructures.length);
      }
    }

    // Create a recharge task for each spawn that needs energy
    findSpawnsToRecharge().forEach(spawn => taskSupervisor.requestNewTask(rechargeTask.makeRequest(spawn)));
  }

  createBuildRequests(room: Room, controller: StructureController) {
    // Create a build task for each construction site in the room
    const buildRequests = taskSupervisor.findRequests(room, request => {
      return request.type === TaskType.BUILD;
    });

    if (buildRequests.length < controller.level * TASKS_PER_TYPE_PCL) {
      for (const cs of findConstructionSitesInRoom(room)) {
        if (taskSupervisor.requestNewTask(buildTask.makeRequest(cs))) break;
      }
    }
  }

  createRepairer(room: Room) {
    const spawn = findFreeSpawnsInRoom(room.name);
    if (countCreepsWithName("Repairer", room) === 0) {
      const repairStructures = findStructuresNeedingRepair(room, 0.9);
      if (spawn && repairStructures.length > 0) {
        const structures = repairStructures.splice(0, 4);
        const taskRequests = structures.map(s => repairTask.makeRequest(s));
        taskRequests.push(suicideTask.makeRequest());
        spawnSupervisor.requestNewMinion({
          name: `Repairer${Game.time}`,
          spawnId: spawn.id,
          bodyParts: [MOVE, CARRY, WORK, CARRY, WORK],
          taskRequests: taskRequests
        });
      }
    }
  }

  createRepairRequests(room: Room) {
    const repairRequests = taskSupervisor.findRequests(room, request => {
      return request.tasks[0].type === TaskType.REPAIR;
    });
    if (repairRequests.length < 4) {
      for (const rs of findStructuresNeedingRepair(room, 0.9)) {
        if (repairRequests.findIndex(r => r.tasks[0].target === rs.id) === -1) {
          taskSupervisor.requestNewTask(repairTask.makeRequest(rs));
          break;
        }
      }
    }
  }

  createMiners(room: Room) {
    // Create miners
    const spawn = findFreeSpawnsInRoom(room.name);
    const sources = findSourcesInRoom(room);
    for (const source of sources) {
      const container = findContainersNearPosition(source.pos, 2);
      const target = container[0] || source;
      const distance = container[0] ? 0 : 1;
      if (countCreepsWithName(`Miner${source.id}`, room) === 0) {
        if (spawn) {
          const taskRequest = mineTask.makeRequest(source, { pos: target.pos, distance: distance });
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

    const containerNearSpawn = findContainerNearSpawn(spawn);
    if (!containerNearSpawn) return;

    const containers = findContainersInRoom(room);

    for (const container of containers) {
      if (container.id === containerNearSpawn.id) continue;
      if (countCreepsWithName(`Hauler${container.id}`, room) === 0) {
        if (spawn) {
          const taskRequest = haulTask.makeRequest(container);
          spawnSupervisor.requestNewMinion({
            name: `Hauler${container.id}`,
            spawnId: spawn.id,
            bodyParts: [MOVE, CARRY, CARRY, MOVE, CARRY],
            taskRequests: [taskRequest]
          });
          break;
        }
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
    if (scavengerCount < 2) {
      const taskRequest = scavengeTask.makeRequest(spawn);
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
    if (controller && upgraderCount < controller.level * UPGRADERS_PCL) {
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
