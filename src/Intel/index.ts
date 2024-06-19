import { taskManager } from "task-manager";
import { initializeRoomMemory } from "./Rooms/initializeRoomMemory";
import { ScannedRoomEvent } from "./events";

export const runIntel = () => {
  taskManager.run(
    [
      ...Object.keys(Game.rooms)
        .sort((a, b) => (Memory.rooms[a]?.scanned ?? 0) - (Memory.rooms[b]?.scanned ?? 0))
        .map(room => ({
          name: "Scan room",
          mandatory: Game.rooms[room]?.controller?.my,
          fn() {
            const scannedRoom: ScannedRoomEvent = {
              room,
              office: !!Game.rooms[room].controller?.my
            };

            initializeRoomMemory(scannedRoom);
          }
        }))
    ],
    Game.cpu.limit * 0.1
  );
};
