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
          isStorageLink: true,
          sourceId: link.id,
          targetId: link.room.memory.storageId as string,
          roomName: link.room.name
        };
      } else {
        Memory.links[link.id] = {
          isStorageLink: false,
          sourceId: this.findSource(link).id,
          targetId: link.id,
          roomName: link.room.name
        };
      }
    }

    const linkMetaData = Memory.links[link.id];
    if (!linkMetaData.isStorageLink) {
      const targetLink = this.getStorageLink(link.room);
      if (
        targetLink &&
        targetLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
        link.store.getFreeCapacity(RESOURCE_ENERGY) === 0
      ) {
        link.transferEnergy(targetLink);
      }
    }
  }

  private isCloseToStorage(link: StructureLink, range = 1): boolean {
    const storageId = link.room.memory.storageId;
    const storage = storageId ? Game.getObjectById(storageId) : undefined;
    if (!storage) return false;
    return link.pos.inRangeTo((storage as StructureStorage).pos, range);
  }

  private findSource(link: StructureLink): StructureContainer {
    return link.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: x => {
        return x.structureType === STRUCTURE_CONTAINER;
      }
    }) as StructureContainer;
  }

  private getStorageLink(room: Room): StructureLink | undefined {
    const link = _.find(Memory.links, l => l.roomName === room.name && l.isStorageLink);

    return link && link.sourceId ? (Game.getObjectById(link.sourceId) as StructureLink) : undefined;
  }

  public removeTransferrer(creep: Creep): void {
    _.forEach(Memory.links, link => {
      if (link.transferrerId === creep.id) {
        delete link.transferrerId;
        return false;
      }
      return true;
    });
  }

  public findLinkForTransferrer(creep: Creep): StructureLink | undefined {
    let linkId;
    _.forEach(Memory.links, (link, id) => {
      if (link.transferrerId === creep.id) {
        linkId = id;
        return false;
      }
      return true;
    });

    if (!linkId) {
      // Find unassigned Link
      _.forEach(Memory.links, (link, id) => {
        if (!link.transferrerId || !Game.getObjectById(link.transferrerId)) {
          link.transferrerId = creep.id;
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
