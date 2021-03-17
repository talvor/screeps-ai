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

    if (!creep.memory.full) {
      return this.harvest(creep);
    } else if (this.upgrade(creep)) {
      return true;
    } else {
      this.waitAtFlag(creep);
    }

    return false;
  }
}

export const roleUpgrader = new RoleUpgrader();
