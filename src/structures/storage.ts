import { StructBase } from './base';

export class StructStorage extends StructBase {
  public constructor() {
    super(STRUCTURE_CONTAINER);
  }
}

export const structStorage = new StructStorage();
