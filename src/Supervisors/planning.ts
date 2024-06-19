declare global {
  interface Memory {
    roomPlans: Record<string, RoomPlan>;
  }
}

interface RoomPlan {
  name: string;
  complete: boolean;
}

Memory.roomPlans ??= {};

class PlanningSupervisor {
  planRooms() {
    let start = Game.cpu.getUsed();
    if (Game.cpu.bucket < 500) return; // Don't do room planning at low bucket levels

    for (let room in Memory.rooms) {
      if (Memory.roomPlans[room]?.complete) continue; // Already planned
      if (!Memory.rooms[room].controllerId) continue; // No controller or room hasn't been properly scanned yet
      if (Game.cpu.getUsed() - start <= 5) {
        // generateRoomPlans(room);
        Memory.roomPlans[room] = {
          name: room,
          complete: true
        };
      }
    }
  }
}

export const planningSupervisor = new PlanningSupervisor();
