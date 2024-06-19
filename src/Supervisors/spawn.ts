import { uuid } from "utils/uuid";
import { NewTaskRequest } from "./task";

declare global {
  interface Memory {
    spawnRequests: Array<SpawnRequest>;
  }
}

interface SpawnRequest {
  name: string;
  spawnId: string;
  bodyParts: Array<BodyPartConstant>;
  stickyTask?: NewTaskRequest;
}

class SpawnSupervisor {
  requestNewMinion(spawnRequest: SpawnRequest) {
    if (Memory.spawnRequests.findIndex(sr => sr.name === spawnRequest.name) === -1) {
      console.log(`SpawnerSupervisor: scheduling spawn request ${spawnRequest.name}`);
      Memory.spawnRequests.push(spawnRequest);
    }
  }
  runSpawner() {
    const spawns = Object.values(Game.spawns);
    for (const spawn of spawns) {
      if (!spawn.spawning) {
        const pendingRequests = Memory.spawnRequests.filter(request => request.spawnId === spawn.id);
        const request = pendingRequests.shift();
        if (request) {
          const bodyParts: Array<BodyPartConstant> = [];

          for (const bodyPart of request.bodyParts) {
            bodyParts.push(bodyPart);
            const cost = this.bodyPartCost(bodyParts);
            if (cost > spawn.room.energyAvailable) {
              // we found our limit, remove the excess body part and spawn.
              bodyParts.pop();
              break;
            }
          }

          // Creep should have at least 3 body parts
          if (bodyParts.length < 3) {
            continue;
          }

          if (spawn.spawnCreep(bodyParts, request.name, { dryRun: true }) === OK) {
            console.log(`SpawnerSupervisor: spawning ${request.name} with bodyparts ${JSON.stringify(bodyParts)}`);
            const opts: SpawnOptions = {};
            if (request.stickyTask) {
              opts.memory = {
                busy: true,
                taskRequest: { ...request.stickyTask, sticky: true, id: uuid.v4() }
              };
            }
            spawn.spawnCreep(bodyParts, request.name, opts);
            Memory.spawnRequests = Memory.spawnRequests.filter(r => r.name !== request.name);
          }
        }
      }
    }
  }

  getRequestCount(spawn: StructureSpawn, filterFn?: (request: SpawnRequest) => boolean): number {
    const requests = Memory.spawnRequests.filter(request => {
      if (request.spawnId !== spawn.id) return false;
      if (filterFn) return filterFn(request);
      return true;
    });
    return requests.length;
  }

  private bodyPartCost(bodyParts: BodyPartConstant[]): number {
    return bodyParts.reduce((acc, part) => {
      return acc + BODYPART_COST[part];
    }, 0);
  }
}

export const spawnSupervisor = new SpawnSupervisor();
