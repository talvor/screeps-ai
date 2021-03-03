// example declaration file - remove these and add your own custom typings

// memory extensions
interface CreepMemory {
  _say?: string;
  full?: boolean;
  sId?: string;
  fallenResourceId?: string;
  rechargeId?: string;
  cId?: string;
  repairId?: string;
  blocked?: number;
  origin?: string;
}

interface Memory {
  uuid: number;
  log: any;
  gcl: number;
  roads: Record<string, number[]>;
  con: Record<string, IBuildOrder[]>;
  buildOrderCount: number;
}

interface RoomMemory {
  setup: number;
  phase: number;
  roomName: string;
  exits: {
    [key: string]: boolean | string;
  };
  sMiners: {
    [key: string]: number;
  };
  lastChecked: number;
  storageId?: string;
}

interface SpawnMemory {
  setup: number;
  level?: number;
}

// Object extensions
interface Creep {
  busy: number;
}

// `global` extension
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}

interface IBuildOrder {
  type: BuildableStructureConstant;
  pos: string | RoomPosition;
  queue?: number;
}

interface BuildOrder {
  type: BuildableStructureConstant;
  pos: RoomPosition;
}

interface IRole {
  count: number;
  parts: BodyPartConstant[];
  minimumEnergyToSpawn?: number;
  shardwide?: boolean;
}

// Interfaces
interface IStructureOpts {
  howmanyAtEachPoi?: number;
  minFreeAdjSpaces?: number;
  minPlacementDistance?: number;
  avoidList?: any[];
  avoidIsCheckered?: boolean;
  structureFilter?: FilterFunction<FindConstant> | FilterObject;
}
