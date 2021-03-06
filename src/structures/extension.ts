import { StructBase } from './base';
export class StructExtension extends StructBase {
  public constructor() {
    super(STRUCTURE_EXTENSION);
  }
}

export const structExtension = new StructExtension();
