import { StructBase } from './base';
export class StructLink extends StructBase {
  public constructor() {
    super(STRUCTURE_LINK);
  }

  public preRun(): void {
    if (!Memory.links) Memory.links = {};
  }

  public run(link: StructureLink): void {
    if (!this.is(link)) return;

    if (!Memory.links[link.id]) {
      if (this.isCloseToStorage(link)) {
        Memory.links[link.id] = {
          isStorageLink: true
        };
      } else {
        const target = this.findStorageLink(link.room);
        if (target) {
          Memory.links[link.id] = {
            targetId: target.id
          };
        }
      }
    }

    const targetLink = this.getTargetLink(link);
    if (
      targetLink &&
      targetLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
      link.store.getFreeCapacity(RESOURCE_ENERGY) === 0
    ) {
      link.transferEnergy(targetLink);
    }
  }

  private isCloseToStorage(link: StructureLink, range = 1): boolean {
    const storageId = link.room.memory.storageId;
    const storage = storageId ? Game.getObjectById(storageId) : undefined;
    if (!storage) return false;
    return link.pos.inRangeTo((storage as StructureStorage).pos, range);
  }

  private findStorageLink(room: Room): StructureLink | undefined {
    let struct;
    const links = this.getMyStructs(room);
    _.forEach(links, link => {
      if (Memory.links[link.id].isStorageLink) {
        struct = link;
        return false;
      }
      return true;
    });

    return struct;
  }

  private getTargetLink(link: StructureLink): StructureLink | undefined {
    const targetId = Memory.links[link.id].targetId;
    if (targetId) {
      return Game.getObjectById(targetId) as StructureLink;
    }
    return undefined;
  }

  public removeHarvester(creep: Creep): void {
    _.forEach(Memory.links, link => {
      if (link.harvesterId === creep.id) {
        delete link.harvesterId;
        return false;
      }
      return true;
    });
  }

  public findLinkForHarvester(creep: Creep): StructureLink | undefined {
    let linkId;
    _.forEach(Memory.links, (link, id) => {
      if (link.harvesterId === creep.id) {
        linkId = id;
        return false;
      }
      return true;
    });

    if (!linkId) {
      // Find unassigned Link
      _.forEach(Memory.links, (link, id) => {
        if (!link.harvesterId || !Game.getObjectById(link.harvesterId)) {
          link.harvesterId = creep.id;
          linkId = id;
          return false;
        }
        return true;
      });
    }
    if (linkId) {
      return Game.getObjectById(linkId) as StructureLink;
    }
    return undefined;
  }
}

export const structLink = new StructLink();
