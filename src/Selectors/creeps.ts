export const findCreepsInRoom = (roomName: string): Array<Creep> => {
  return Object.values(Game.creeps).filter(creep => creep.room.name === roomName && !creep.spawning);
};
