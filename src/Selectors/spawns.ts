export const findSpawnsToRecharge = (): Array<StructureSpawn> => {
  return Object.values(Game.spawns).filter(spawn => spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
};
