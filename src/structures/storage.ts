import { StructBase } from './base';

export class StructStorage extends StructBase {
  public constructor() {
    super(STRUCTURE_STORAGE);
  }
}

export const structStorage = new StructStorage();
