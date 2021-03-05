import { AvoidStructure } from 'utils/Avoid';

import { StructBase } from './base';

function findStorageAndContainers(s: Structure): boolean {
  const type = s.structureType;
  return type === STRUCTURE_CONTAINER || type === STRUCTURE_STORAGE;
}

export class StructContainer extends StructBase {
  public constructor() {
    super(STRUCTURE_CONTAINER, {
      howmanyAtEachPoi: 1,
      minFreeAdjSpaces: 4,
      minPlacementDistance: 7,
      structureFilter: findStorageAndContainers,
      avoidList: [
        new AvoidStructure(STRUCTURE_CONTAINER, { range: 7 })
        // new AvoidStructure(STRUCTURE_STORAGE, {range: 7})
      ]
    });
  }

  public getDesiredNumberOfStructs(room: Room): number {
    const res = room.find(FIND_SOURCES);
    if (res && res.length) {
      return res.length;
    }
    console.log('Containers.getDesiredNum failed: ' + JSON.stringify(res));
    return 0;
  }
}

export const structContainer = new StructContainer();
