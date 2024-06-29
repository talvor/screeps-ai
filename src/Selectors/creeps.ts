import { findSpawnsInRoom } from "./spawns";

export const findCreepsInRoom = (roomName: string): Array<Creep> => {
  return Object.values(Game.creeps).filter(creep => creep.room.name === roomName && !creep.spawning);
};

export const findBusyCreeps = (): Array<Creep> => {
  return Object.values(Game.creeps).filter(creep => creep.memory.busy);
};

export const findIdleCreeps = (): Array<Creep> => {
  return Object.values(Game.creeps).filter(creep => !creep.memory.busy);
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

export type EnergySource = Source | Resource | StructureContainer | Ruin;

export const findClosestEnergySource = (creep: Creep): EnergySource | undefined => {
  // Find dropped resources
  const droppedResource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
  if (droppedResource) return droppedResource;

  // Find dropped ruins
  const ruin = creep.pos.findClosestByPath(FIND_RUINS, { filter: r => r.store.getUsedCapacity(RESOURCE_ENERGY) > 0 });
  if (ruin) return ruin;

  // Find containers
  const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: s => {
      return (
        s.structureType === STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity()
      );
    }
  });
  if (container) return container as StructureContainer;

  // Find source
  return creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE) || undefined;
};

export const findClosestFreeSource = (creep: Creep): EnergySource | undefined => {
  // Find dropped resources
  const droppedResource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
  if (droppedResource) return droppedResource;

  // Find dropped ruins
  const ruin = creep.pos.findClosestByPath(FIND_RUINS, { filter: r => r.store.getUsedCapacity(RESOURCE_ENERGY) > 0 });
  if (ruin) return ruin;

  return undefined;
};

export const findClosestDepositStructure = (
  creep: Creep,
  filterFn?: (s: StructureContainer) => boolean
): StructureContainer | undefined => {
  // Find dropped resources
  const structure = creep.pos.findClosestByPath<StructureContainer>(FIND_STRUCTURES, {
    filter: s => {
      if (s.structureType !== STRUCTURE_CONTAINER) return false;
      if (filterFn) return filterFn(s);
      return true;
    }
  });

  if (structure) return structure;
  return undefined;
};
