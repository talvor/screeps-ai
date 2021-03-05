import { ROOM_LEVEL } from '../constants';
import { buildController } from 'controllers/build';

export abstract class StructBase {
  private structureType: BuildableStructureConstant;
  public howmanyAtEachPoi: number;
  public minFreeAdjSpaces: number;
  public minPlacementDistance: number;
  public avoidList: any[];
  public avoidIsCheckered: boolean;
  public structureFilter: FilterFunction<FindConstant> | FilterObject;

  private _structs: {
    [key: string]: AnyStructure[];
  } = {};

  private _sites: {
    [key: string]: ConstructionSite[];
  } = {};

  public constructor(structureType: BuildableStructureConstant, opts: IStructureOpts) {
    this.structureType = structureType;
    this.howmanyAtEachPoi = opts.howmanyAtEachPoi || -1;
    this.minFreeAdjSpaces = opts.minFreeAdjSpaces || 3;
    this.minPlacementDistance = opts.minPlacementDistance || 7;
    this.avoidList = opts.avoidList || [];
    this.avoidIsCheckered = opts.avoidIsCheckered || false;
    this.structureFilter = opts.structureFilter || { structureType };
    this.gc();
  }

  public getMyStructs(room: Room): AnyStructure[] {
    if (!this._structs[room.name]) {
      this._structs[room.name] = room.find(FIND_STRUCTURES, { filter: this.structureFilter });
    }
    return this._structs[room.name];
  }

  public getMySites(room: Room): ConstructionSite[] {
    if (!this._sites[room.name]) {
      this._sites[room.name] = room.find(FIND_CONSTRUCTION_SITES, { filter: this.structureFilter });
    }
    return this._sites[room.name];
  }

  public getDesiredNumberOfStructs(room: Room): number {
    const lvl = room.controller ? room.controller.level : 0;
    return CONTROLLER_STRUCTURES[this.structureType][lvl] || 0;
  }

  private getDesiredRange(room: Room): number {
    const lvl = room.controller ? room.controller.level : 0;
    const info: ILevelStructure = ROOM_LEVEL[lvl];
    const num = info[this.structureType + 'Range'];
    return num || 5;
  }

  public buildInRoom(room: Room): boolean {
    const existingExt = this.getMyStructs(room);
    const existingSites = this.getMySites(room);
    const plannedSitesCount: number = buildController.getCount(room, this.structureFilter);
    const desired = this.getDesiredNumberOfStructs(room);
    const howmanyBuilt = existingExt.length + existingSites.length;
    const howmanyToBuild = desired - howmanyBuilt - plannedSitesCount;
    const range = this.getDesiredRange(room);

    if (!room || !(room instanceof Room)) {
      console.log('buildInRoom failed because it needs valid room');
      return false;
    }

    if (howmanyToBuild < 1) {
      console.log(`No ${this.structureType} to create in ${room}. Already enough: ${howmanyBuilt}/${desired}`);
      return false;
    }

    console.log(`Bulding ${this.structureType}`);
    console.log(` desired=${desired}`);
    console.log(` howmanyBuilt=${howmanyBuilt}`);
    console.log(` howmanyToBuild=${howmanyToBuild}`);
    console.log(` range=${range}`);

    // if (howmanyToBuild) {
    //   console.log(`Unable to build ${howmanyToBuild} ${this.structureType}(s) in ${room}`);
    // }
    return howmanyToBuild === 0;
  }

  private gc(): void {
    this._structs = {};
    this._sites = {};
  }
}
