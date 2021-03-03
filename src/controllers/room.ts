import { EXITS } from '../constants';

export class RoomController {
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
      data.sMiners[source.id] = 0;
    });
    data.phase = 1;
    data.lastChecked = Game.time;
    return data;
  }
}

export const roomController = new RoomController();
