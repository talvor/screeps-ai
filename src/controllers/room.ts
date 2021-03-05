import { EXITS } from '../constants';

const _lowHealthStructs: { [key: string]: AnyStructure[] } = {};

export class RoomController {
  public preRun(): void {
    if (!Memory.rooms) Memory.rooms = {};
    for (const roomName in Game.rooms) {
      this.initialize(roomName);
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
    const data: RoomMemory = { roomName, exits: {}, sMiners: {}, lastChecked: 0, phase: 0, setup: 1 };
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
    data.phase = 1;
    data.lastChecked = Game.time;
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
      _lowHealthStructs[roomName] = room.find<AnyStructure>(FIND_STRUCTURES, {
        filter: (s: AnyStructure | StructureWall | StructureRampart) => {
          if (!s.hits || !s.hitsMax) return false;
          if (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) return false;

          const healthRatio = this.healthRatio(s.hits, s.hitsMax);
          const threshold = s.structureType === STRUCTURE_ROAD ? roadThreshold : structureThreshold;

          return healthRatio < threshold;
        }
      });
    }

    if (!_lowHealthStructs[roomName] || _lowHealthStructs[roomName].length === 0) return;
    _lowHealthStructs[roomName].sort(
      (a, b) => this.healthRatio(a.hits, b.hitsMax) - this.healthRatio(b.hits, b.hitsMax)
    );
    return _lowHealthStructs[roomName].pop();
  }
}

export const roomController = new RoomController();
