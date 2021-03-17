import { ROLES, STORAGE_MINIMUM } from '../constants';

import { RoleBase } from './base';
import { structLink } from 'structures/link';

const ROLE = ROLES.Transferrer;

export class RoleTransferrer extends RoleBase {
  public constructor() {
    super(ROLE);
  }

  public run(creep: Creep): boolean {
    if (creep.busy || !this.is(creep)) return false;

    const link = structLink.findLinkForTransferrer(creep);
    if (!link) return false;
    const linkMetadata = Memory.links[link.id];

    if (linkMetadata) {
      const source = Game.getObjectById(linkMetadata.sourceId) as StructureContainer | StructureLink;
      const target = Game.getObjectById(linkMetadata.targetId) as StructureStorage | StructureLink;

      if (!creep.memory.full) {
        return this.withdraw(creep, source);
      } else {
        return this.recharge(creep, target);
      }
    }
    return false;
  }

  private withdraw(creep: Creep, source: StructureContainer | StructureLink): boolean {
    const containerFreeCapacity = (source as StructureContainer).store.getUsedCapacity(RESOURCE_ENERGY);
    const creepCapactity = creep.store.getCapacity(RESOURCE_ENERGY);
    if (containerFreeCapacity >= creepCapactity) {
      const code = creep.withdraw(source, RESOURCE_ENERGY);

      this.emote(creep, '🔄 withdraw', code);

      if (code === OK) {
        creep.busy = 1;
        return true;
      } else if (code === ERR_NOT_IN_RANGE) {
        this.travelTo(creep, source, '#ffaa00'); // orange
        creep.busy = 1;
        return true;
        // What about using Storage???
      } else if (code === ERR_NOT_ENOUGH_RESOURCES) {
        delete creep.memory.sId;
      } else if (code === ERR_NO_BODYPART) {
        // unable to harvest?
        this.suicide(creep);
      }
    }
    return false;
  }

  private recharge(creep: Creep, target: StructureStorage | StructureLink): boolean {
    const code = creep.transfer(target, RESOURCE_ENERGY);

    this.emote(creep, '🔄 transfer', code);

    if (code === OK) {
      creep.busy = 1;
      return true;
    } else if (code === ERR_NOT_IN_RANGE) {
      this.travelTo(creep, target, '#ffaa00'); // orange
      creep.busy = 1;
      return true;
      // What about using Storage???
    } else if (code === ERR_NOT_ENOUGH_RESOURCES) {
      delete creep.memory.sId;
    } else if (code === ERR_NO_BODYPART) {
      // unable to harvest?
      this.suicide(creep);
    }
    return false;
  }
}

export const roleTransferrer = new RoleTransferrer();
