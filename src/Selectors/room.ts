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
