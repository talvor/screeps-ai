import { ROLES } from '../constants';
import { RoleBase } from './base';
import { check } from 'utils/errors';

const ROLE = ROLES.Upgrader;

export class RoleUpgrader extends RoleBase {
  public constructor() {
    super(ROLE);
  }

  public run(creep: Creep): boolean {
    if (creep.busy || !this.is(creep)) return false;

    if (creep.memory.full) {
      let controller = creep.room.controller;
      if (controller && creep.memory.origin && controller.room.name !== creep.memory.origin) {
        controller = Game.rooms[creep.memory.origin].controller;
      }
      if (!controller) {
        console.log(`${creep.name} cannot find its controller. Assigned to ${creep.memory.origin}.`);
        return false;
      }
      if (!controller.my) {
        console.log(`${creep.name} attempting to upgrade at a controller not owned by us!`);
      }
      const code = creep.upgradeController(controller);
      this.emote(creep, '⚡ upgrade');
      if (code === OK) {
        creep.busy = 1;
      } else if (code === ERR_NOT_IN_RANGE) {
        this.travelTo(creep, controller.pos, '#4800FF'); // blue
      } else if (code === ERR_NOT_OWNER) {
        console.log(`${creep.name} is lost in ${creep.room.name}`);
      } else if (code === ERR_NO_BODYPART) {
        // unable to upgrade?
        this.suicide(creep);
      } else {
        check(creep, 'upgradeController', code);
      }
    } else {
      this.harvest(creep);
    }
    return true;
  }
}

export const roleUpgrader = new RoleUpgrader();
