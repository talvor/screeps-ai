import { StructBase } from './base';

function findStorageAndContainers(s: Structure): boolean {
  const type = s.structureType;
  return type === STRUCTURE_CONTAINER || type === STRUCTURE_STORAGE;
}

export class StructContainer extends StructBase {
  public constructor() {
    super(STRUCTURE_CONTAINER, {
      structureFilter: findStorageAndContainers
    });
  }
}

export const structContainer = new StructContainer();
