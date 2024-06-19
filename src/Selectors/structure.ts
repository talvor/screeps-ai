export const findConstructionSitesInRoom = (room: Room): Array<ConstructionSite> => {
  return room.find(FIND_MY_CONSTRUCTION_SITES);
};

export const findExtensionsInRoom = (
  room: Room,
  filterFn?: (extension: StructureExtension) => boolean
): Array<StructureExtension> => {
  const extensions = room.find<StructureExtension>(FIND_MY_STRUCTURES, {
    filter: { structureType: STRUCTURE_EXTENSION }
  });
  if (!filterFn) return extensions;
  return extensions.filter(filterFn);
};

export const findTowersInRoom = (room: Room, filterFn?: (tower: StructureTower) => boolean): Array<StructureTower> => {
  const towers = room.find<StructureTower>(FIND_MY_STRUCTURES, {
    filter: { structureType: STRUCTURE_TOWER }
  });
  if (!filterFn) return towers;
  return towers.filter(filterFn);
};

export const findStructuresNeedingRepair = (room: Room, repairThreshold = 0.5): Array<Structure> => {
  const structures = room.find(FIND_STRUCTURES, {
    filter: s => {
      const damage = s.hitsMax - s.hits;
      const perc = damage / s.hitsMax;
      // console.log(`Structure: ${s.structureType} damage=${damage} perc=${perc}`);
      return perc < repairThreshold;
    }
  });
  return structures;
};
