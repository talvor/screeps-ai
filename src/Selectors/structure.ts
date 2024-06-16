export const findConstructionSitesInRoom = (room: Room): Array<ConstructionSite> => {
  return room.find(FIND_MY_CONSTRUCTION_SITES);
};
