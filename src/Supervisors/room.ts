import { makeRechargeTask } from "Tasks/recharge";
import { makeUpgradeTask } from "Tasks/upgrade";
import { taskSupervisor } from "./task";
import { findSpawnsToRecharge } from "Selectors/spawns";
import { findCreepsInRoom } from "Selectors/creeps";

class RoomSupervisor {
  runRoom() {
    const rooms = Object.values(Game.rooms);
    for (const room of rooms) {
      const controller = room.controller;
      if (controller && controller.my) {
        // Create an upgrade task for each active creep in the room
        findCreepsInRoom(room.name).forEach((_, index) =>
          taskSupervisor.requestNewTask(makeUpgradeTask(controller, index))
        );
      }
    }

    // Create a recharge task for each spawn that needs energy
    findSpawnsToRecharge().forEach(spawn => taskSupervisor.requestNewTask(makeRechargeTask(spawn)));
  }
}

export const roomSupervisor = new RoomSupervisor();
