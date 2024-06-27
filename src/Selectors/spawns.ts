export const findSpawnsToRecharge = (): Array<StructureSpawn> => {
  return Object.values(Game.spawns).filter(spawn => spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
};

export const findSpawnsInRoom = (roomName: string): Array<StructureSpawn> => {
  return Object.values(Game.spawns).filter(spawn => spawn.room.name === roomName);
};

export const findFreeSpawnsInRoom = (roomName: string): StructureSpawn | undefined => {
  return Object.values(Game.spawns).find(spawn => spawn.room.name === roomName && !spawn.spawning);
};

export const findContainerNearSpawn = (spawn: StructureSpawn): StructureContainer | undefined => {
  return (
    spawn.pos.findInRange<FIND_STRUCTURES, StructureContainer>(FIND_STRUCTURES, 3, {
      filter: s => s.structureType === STRUCTURE_CONTAINER
    })[0] || undefined
  );
};
