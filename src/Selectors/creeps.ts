import { findSpawnsInRoom } from "./spawns";

export const findCreepsInRoom = (roomName: string): Array<Creep> => {
  return Object.values(Game.creeps).filter(creep => creep.room.name === roomName && !creep.spawning);
};

export const findBusyCreeps = (): Array<Creep> => {
  return Object.values(Game.creeps).filter(creep => creep.memory.busy);
};

export const countCreepsWithName = (name: string, room: Room): number => {
  const activeCount = Object.values(Game.creeps).filter(
    creep => creep.room.name === room.name && creep.name.startsWith(name)
  ).length;

  const requestCount = findSpawnsInRoom(room.name).reduce((pv, spawn) => {
    return (
      pv + Memory.spawnRequests.filter(request => request.spawnId === spawn.id && request.name.startsWith(name)).length
    );
  }, 0);

  return activeCount + requestCount;
};

export const findClosestEnergySource = (creep: Creep): Source | Resource | StructureContainer | undefined => {
  // Find dropped resources
  const droppedResource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
    filter: resource => resource.amount >= creep.store.getFreeCapacity()
  });
  if (droppedResource) return droppedResource;

  // Find containers
  const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: structure => {
      return (
        structure.structureType === STRUCTURE_CONTAINER &&
        structure.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getFreeCapacity()
      );
    }
  });
  if (container) return container as StructureContainer;

  // Find source
  return creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE) || undefined;
};
