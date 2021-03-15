import { EXITS } from '../constants';
import { buildController } from 'controllers/build';
import { getCityMapForRCL } from 'config/cityMap';

const _lowHealthStructs: { [key: string]: AnyStructure[] } = {};

export class RoomController {
  public preRun(): void {
    if (!Memory.rooms) Memory.rooms = {};
    for (const roomName in Game.rooms) {
      this.initialize(roomName);
      const storageId = Memory.rooms[roomName].storageId;

      if (!storageId) {
        const storage = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
          filter: s => s.structureType === STRUCTURE_STORAGE
        })[0];
        if (storage) {
          Memory.rooms[roomName].storageId = storage.id;
        }
      } else {
        if (!Game.getObjectById(storageId)) {
          delete Memory.rooms[roomName].storageId;
        }
      }
    }
  }

  public initialize(roomName: string): void {
    if (!Memory.rooms[roomName].setup) {
      console.log(`Initializing ${roomName}`);
      const roomData = this.getInitialData(roomName);
      Memory.rooms[roomName] = roomData;
    }
  }

  private getInitialData(roomName: string): RoomMemory {
    const data: RoomMemory = { roomName, exits: {}, sMiners: {}, lastChecked: 0, level: 0, phase: 0, setup: 1 };
    const exits = Game.map.describeExits(roomName);
    EXITS.forEach(exitDir => {
      const isConnected = !!exits[exitDir];

      if (isConnected) {
        const name = exits[exitDir];
        if (name && Memory.rooms[name]) {
          data.exits[exitDir] = name;
        } else {
          data.exits[exitDir] = true;
        }
      } else {
        data.exits[exitDir] = false;
      }
    });
    Game.rooms[roomName].find(FIND_SOURCES).forEach(source => {
      data.sMiners[source.id] = '';
    });
    data.lastChecked = Game.time;
    data.controllerId = Game.rooms[roomName].controller?.id;
    return data;
  }

  public healthRatio(hits: number | undefined, hitsMax: number | undefined): number {
    if (!hits || !hitsMax) return 1;
    const res = hits / hitsMax;
    return res;
  }

  public findLowHealthStructures(
    room: Room | RoomPosition | string,
    structureThreshold: number,
    roadThreshold = 0.2
  ): AnyStructure | undefined {
    // accept Room Object, RoomPosition Object, String
    const roomName = (room as Room).name || (room as RoomPosition).roomName || (room as string);
    room = Game.rooms[roomName];

    if (!_lowHealthStructs[roomName]) {
      const lowHealthBuildings = room.find<AnyStructure>(FIND_STRUCTURES, {
        filter: (s: AnyStructure | StructureWall | StructureRampart) => {
          if (!s.hits || !s.hitsMax) return false;
          if (s.structureType === STRUCTURE_ROAD) return false;
          if (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) return false;

          const healthRatio = this.healthRatio(s.hits, s.hitsMax);
          return healthRatio < structureThreshold;
        }
      });

      const lowHeathRoads = room.find<AnyStructure>(FIND_STRUCTURES, {
        filter: (s: AnyStructure | StructureWall | StructureRampart) => {
          if (!s.hits || !s.hitsMax) return false;
          if (s.structureType !== STRUCTURE_ROAD) return false;

          const healthRatio = this.healthRatio(s.hits, s.hitsMax);

          return healthRatio < roadThreshold;
        }
      });
      _lowHealthStructs[roomName] = lowHealthBuildings.length ? lowHealthBuildings : lowHeathRoads;
    }

    if (!_lowHealthStructs[roomName] || _lowHealthStructs[roomName].length === 0) return;
    _lowHealthStructs[roomName].sort(
      (a, b) => this.healthRatio(a.hits, b.hitsMax) - this.healthRatio(b.hits, b.hitsMax)
    );
    return _lowHealthStructs[roomName].pop();
  }

  public checkCityMap(room: Room): void {
    const level = room.controller?.level || 1;
    const cityMap = getCityMapForRCL(level);
    const spawnPosition = room.find(FIND_MY_SPAWNS)[0].pos;

    if (cityMap) {
      const additionalBuildings = cityMap.additional ? cityMap.additional(room) : {};

      this.checkCityBuildings(room, cityMap.buildings, spawnPosition);
      this.checkCityBuildings(room, additionalBuildings);
    }
  }

  private checkCityBuildings(room: Room, buildings: CityMapBuildings, offsetPosition?: RoomPosition): void {
    for (const key in buildings) {
      if (key !== 'spawn') {
        const builds = buildings[key as BuildableStructureConstant];
        if (builds) {
          for (const pos of builds.pos) {
            let _pos: RoomPosition;
            if (offsetPosition) {
              _pos = new RoomPosition(offsetPosition.x + pos.x, offsetPosition.y + pos.y, room.name);
            } else {
              _pos = new RoomPosition(pos.x, pos.y, room.name);
            }

            const structsAtPos = room.lookForAt(LOOK_STRUCTURES, _pos);
            const constAtPos = room.lookForAt(LOOK_CONSTRUCTION_SITES, _pos);
            let okToBuild = false;

            if (!okToBuild && constAtPos[0] && constAtPos[0].structureType !== (key as BuildableStructureConstant)) {
              console.log(`checkCityMap removing construction site [${constAtPos[0].structureType}]`);
              constAtPos[0].remove();
              okToBuild = true;
            }

            if (!okToBuild && structsAtPos[0] && structsAtPos[0].structureType === STRUCTURE_ROAD) {
              console.log(`checkCityMap removing structure [${structsAtPos[0].structureType}]S`);
              structsAtPos[0].destroy();
              okToBuild = true;
            }

            if (
              !okToBuild &&
              structsAtPos[0] &&
              structsAtPos[0].structureType !== (key as BuildableStructureConstant)
            ) {
              console.log(
                `checkCityMap cannot build ${key} on structure [${structsAtPos[0].structureType}] at ${_pos}`
              );
            }

            if (!structsAtPos[0] && !constAtPos[0]) {
              okToBuild = true;
            }

            if (okToBuild) {
              console.log(`checkCityMap build ${key} at ${_pos}`);
              buildController.schedule(room, key as BuildableStructureConstant, _pos, true);
            }
          }
        }
      }
    }
  }
}

export const roomController = new RoomController();
