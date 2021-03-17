import { ROLES } from '../constants';

export const findCreepsWithRole = (role: ROLES, room?: Room): Creep[] => {
  return _.filter(Game.creeps, creep => {
    if (room && creep.room.name !== room.name) return false;
    return creep.name.startsWith(role);
  });
};
