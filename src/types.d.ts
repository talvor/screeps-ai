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
  sourceId?: string;
  blocked?: number;
  origin?: string;
  isReady?: boolean;
  pos?: string;
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
  controllerId?: string;
  setup: number;
  phase: number;
  level: number;
  roomName: string;
  exits: {
    [key: string]: boolean | string;
  };
  sMiners: {
    [key: string]: string;
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
    findCityArea: (roomName: string) => void;
    getCityMap: (phaseNumber: number) => ICityMapLevel;
    checkMap: (roomName: string) => void;
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
  count: number | string;
  parts: BodyPartConstant[];
  minimumEnergyToSpawn?: number;
  shardwide?: boolean;
}

// Interfaces
interface IStructureOpts {
  structureFilter?: FilterFunction<FindConstant> | FilterObject;
}

interface IRoomLevel {
  [key: number]: ILevelStructure;
}

interface ILevelStructure {
  [key: string]: number;
}

interface IPosition {
  x: number;
  y: number;
}

// interface IMatrix {
//   [key: number]: {
//     [key: number]: IMatrixItem[];
//   };
// }
interface IMatrix {
  [y: number]: IMatrixItem[] | IMatrix;
}
interface IMatrixItem {
  type: string;
  constructionSite?: ConstructionSite;
  creep?: Creep;
  energy?: Resource<RESOURCE_ENERGY>;
  exit?: any; // TODO what type is this?
  flag?: Flag;
  mineral?: Mineral;
  deposit?: Deposit;
  nuke?: Nuke;
  resource?: Resource;
  source?: Source;
  structure?: Structure;
  terrain?: Terrain;
  tombstone?: Tombstone;
  powerCreep?: PowerCreep;
  ruin?: Ruin;
}

interface IBounds {
  nw: IPosition;
  ne: IPosition;
  sw: IPosition;
  se: IPosition;
}

interface ICityMapLevel {
  rcl: string;
  buildings: CityMapBuildings;
  additional?: CityMapAdditional;
}

type CityMapBuildings = {
  [key in BuildableStructureConstant]?: {
    pos: IPosition[];
  };
};
type CityMap = ICityMapLevel[];
type CityMapAdditional = (room: Room) => CityMapBuildings;
