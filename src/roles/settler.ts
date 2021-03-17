import { ROLES } from '../constants';
import { RoleBase } from './base';
import { findCreepsWithRole } from 'utils/findCreeps';
import { phaseController } from 'controllers/phase';

const ROLE = ROLES.Settler;

export class RoleSettler extends RoleBase {
  public constructor() {
    super(ROLE);
  }

  public run(creep: Creep): boolean {
    if (creep.busy || !this.is(creep)) return false;

    const claimFlag = Game.flags.ClaimController;
    if (claimFlag) {
      const spawns = claimFlag.room?.find(FIND_MY_SPAWNS);
      if (spawns && spawns.length > 0) {
        claimFlag.remove();
        return false;
      }

      if (!creep.memory.settlerInRoom) {
        if (!creep.pos.isNearTo(claimFlag.pos)) {
          this.travelTo(creep, claimFlag.pos, '#ffaa00'); // orange
          creep.busy = 1;
          return true;
        } else {
          creep.memory.settlerInRoom = true;
        }
      }
      const roomController = claimFlag.room?.controller as StructureController;

      if (!roomController.my) {
        let code;
        code = creep.claimController(roomController);
        this.emote(creep, '🏁 claim', code);

        if (code === OK) {
          creep.busy = 1;
          // claimFlag.remove();
          return true;
        } else if (code === ERR_NOT_IN_RANGE) {
          code = this.travelTo(creep, roomController.pos, '#ffaa00'); // orange
          creep.busy = 1;
          return true;
        } else if (code === ERR_NO_BODYPART) {
          // unable to claim?
          this.suicide(creep);
        }
      } else {
        if (!creep.memory.full) {
          return this.harvest(creep);
        } else {
          if (this.build(creep)) {
            return true;
          }
        }
      }
    } else {
      if (!creep.memory.full) {
        return this.harvest(creep);
      } else {
        if (this.upgrade(creep)) {
          return true;
        }
      }
    }

    return false;
  }
}

export const roleSettler = new RoleSettler();
