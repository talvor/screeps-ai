export const findSpawnsToRecharge = (): Array<StructureSpawn> => {
  return Object.values(Game.spawns).filter(spawn => spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
};

export const findSpawnsInRoom = (roomName: string): Array<StructureSpawn> => {
  return Object.values(Game.spawns).filter(spawn => spawn.room.name === roomName);
};

export const findFreeSpawnsInRoom = (roomName: string): StructureSpawn | undefined => {
  return Object.values(Game.spawns).find(spawn => spawn.room.name === roomName && !spawn.spawning);
};
