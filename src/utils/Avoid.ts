const FREE_BUT_DISQUALIFIED = 1;

interface iOpts {
  range?: number;
  resolveTo?: number;
  isCheckered?: boolean;
}

export class AvoidStructure {
  private structureType: StructureConstant;
  public range: number;
  public type: number;
  private isCheckered: boolean;

  public constructor(structureType: StructureConstant, opts: iOpts = {}) {
    this.structureType = structureType;
    this.range = opts.range || 1;
    this.type = opts.resolveTo || 0; // optional. Will be set by AVOID by findFreePosNearby
    this.isCheckered = opts.isCheckered || false; // optional.
  }
  // @ts-ignore
  public filter(o: any): boolean {
    // let res = o.type === LOOK_STRUCTURES && o.structureType === this.structureType;
    // res = res || (o.type === LOOK_CONSTRUCTION_SITES && o.structureType === this.structureType);
    // return res;
    return true;
  }
}

export const AVOID_LIST = {
  [STRUCTURE_ROAD]: new AvoidStructure(STRUCTURE_ROAD, { range: 0, resolveTo: FREE_BUT_DISQUALIFIED }),
  [STRUCTURE_SPAWN]: new AvoidStructure(STRUCTURE_SPAWN, { range: 1 }),
  [STRUCTURE_CONTROLLER]: new AvoidStructure(STRUCTURE_CONTROLLER, { range: 4 }),
  [STRUCTURE_EXTENSION]: new AvoidStructure(STRUCTURE_EXTENSION, { range: 1, isCheckered: true }),
  [STRUCTURE_CONTAINER]: new AvoidStructure(STRUCTURE_CONTAINER, { range: 2 }),
  [STRUCTURE_STORAGE]: new AvoidStructure(STRUCTURE_STORAGE, { range: 2 }),
  [STRUCTURE_TOWER]: new AvoidStructure(STRUCTURE_TOWER, { range: 7 }),
  // @ts-ignore
  [LOOK_SOURCES]: { range: 2, filter: o => o.type === LOOK_SOURCES }
};
