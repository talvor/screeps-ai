export const findSourcesInRoom = (room: Room): Array<Source> => {
  const sources: Array<Source> = [];
  const sourceIds = Memory.rooms[room.name].sourceIds;
  if (sourceIds) {
    sourceIds.forEach(id => {
      const source = Game.getObjectById(id);
      if (source) sources.push(source);
    });
  }
  return sources;
};

export const findContainersInRoom = (room: Room): Array<StructureContainer> => {
  return room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER });
};

export const findTowersInRoom = (room: Room): Array<StructureTower> => {
  return room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER });
};

export type EnergySource = Resource | Ruin;

export const findFreeSource = (creep: Creep): EnergySource | undefined => {
  let energySource: EnergySource | undefined = undefined;
  // Find dropped resources
  const droppedResource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
  if (droppedResource) energySource = droppedResource;

  // Find dropped ruins
  const ruin = creep.pos.findClosestByPath(FIND_RUINS, { filter: r => r.store.getUsedCapacity(RESOURCE_ENERGY) > 0 });
  if (ruin && energySource) {
    if (creep.pos.getRangeTo(ruin) < creep.pos.getRangeTo(energySource)) {
      energySource = ruin;
    }
  }

  return energySource;
};

export const findContainerNearSource = (source: Source): StructureContainer | undefined => {
  return (
    source.pos.findInRange<FIND_STRUCTURES, StructureContainer>(FIND_STRUCTURES, 1, {
      filter: s => s.structureType === STRUCTURE_CONTAINER
    })[0] || undefined
  );
};
