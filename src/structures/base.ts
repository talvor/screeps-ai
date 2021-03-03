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

  private gc(): void {
    this._structs = {};
    this._sites = {};
  }
}
