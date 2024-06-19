import { makeRechargeTask } from "Tasks/recharge";
import { makeUpgradeTask } from "Tasks/upgrade";
import { taskSupervisor } from "./task";
import { findFreeSpawnsInRoom, findSpawnsToRecharge } from "Selectors/spawns";
import { findConstructionSitesInRoom, findExtensionsInRoom, findTowersInRoom } from "Selectors/structure";
import { makeBuildTask } from "Tasks/build";
import { spawnSupervisor } from "./spawn";
import { TaskActionType } from "Tasks/task";
import { countCreepsWithName } from "Selectors/creeps";
import { findContainersInRoom, findSourcesInRoom } from "Selectors/room";
import { makeMineTask } from "Tasks/mine";
import { blockSquare } from "screeps-cartographer";

const WORKERS_PCL = 2; // Workers per controller level
const BUILD_TASK_PCL = 2; // Build tasks per controller level
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

        // Create task requests
        this.createBuildRequests(room, controller);

        // Create recharge task for extensions that need energy
        findExtensionsInRoom(room, extension => {
          return extension.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }).forEach(extension => taskSupervisor.requestNewTask(makeRechargeTask(extension)));

        // Create recharge task for towers that need energy
        findTowersInRoom(room, tower => {
          return tower.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }).forEach(tower => taskSupervisor.requestNewTask(makeRechargeTask(tower)));
      }
    }

    // Create a recharge task for each spawn that needs energy
    findSpawnsToRecharge().forEach(spawn => taskSupervisor.requestNewTask(makeRechargeTask(spawn)));
  }

  createBuildRequests(room: Room, controller: StructureController) {
    // Create a build task for each construction site in the room
    const buildRequests = taskSupervisor.findRequests(room, request => {
      return request.task.type === TaskActionType.BUILD;
    });

    if (buildRequests.length < controller.level * BUILD_TASK_PCL) {
      for (const cs of findConstructionSitesInRoom(room)) {
        if (buildRequests.findIndex(r => r.task.action.target === cs.id) === -1) {
          taskSupervisor.requestNewTask(makeBuildTask(cs, room.name));
          break;
        }
      }
    }
  }

  createMiners(room: Room) {
    // Create miners
    const spawn = findFreeSpawnsInRoom(room.name);
    const containers = findContainersInRoom(room);
    if (containers.length > 0) {
      for (const container of containers) {
        if (countCreepsWithName(`Miner${container.id}`, room) === 0) {
          const source = container.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
          if (spawn && source) {
            blockSquare(container.pos);
            const taskRequest = makeMineTask(source, container.pos, 0);
            spawnSupervisor.requestNewMinion({
              name: `Miner${container.id}`,
              spawnId: spawn.id,
              bodyParts: [MOVE, WORK, WORK, WORK, WORK],
              stickyTask: taskRequest
            });
            break;
          }
        }
      }
    } else {
      const sources = findSourcesInRoom(room);
      for (const source of sources) {
        if (countCreepsWithName(`Miner${source.id}`, room) === 0) {
          if (spawn) {
            const taskRequest = makeMineTask(source, source.pos, 1);
            spawnSupervisor.requestNewMinion({
              name: `Miner${source.id}`,
              spawnId: spawn.id,
              bodyParts: [MOVE, WORK, WORK, WORK, WORK],
              stickyTask: taskRequest
            });
            break;
          }
        }
      }
    }
  }

  createUpraders(room: Room) {
    // Create Upgraders
    const spawn = findFreeSpawnsInRoom(room.name);
    const controller = room.controller;
    const upgraderCount = countCreepsWithName("Upgrader", room);
    if (controller && upgraderCount < controller.level * UPGRADERS_PCL) {
      const taskRequest = makeUpgradeTask(controller, Game.time);
      if (spawn) {
        spawnSupervisor.requestNewMinion({
          name: "Upgrader" + Game.time,
          spawnId: spawn.id,
          bodyParts: [WORK, MOVE, CARRY, MOVE, CARRY],
          stickyTask: taskRequest
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
