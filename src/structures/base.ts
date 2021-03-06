export abstract class StructBase {
  public structureType: BuildableStructureConstant;
  public structureFilter: FilterFunction<FindConstant> | FilterObject;

  private _structs: {
    [key: string]: AnyStructure[];
  } = {};

  private _sites: {
    [key: string]: ConstructionSite[];
  } = {};

  public constructor(structureType: BuildableStructureConstant, opts?: IStructureOpts) {
    this.structureType = structureType;
    this.structureFilter = opts?.structureFilter || { structureType };
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
