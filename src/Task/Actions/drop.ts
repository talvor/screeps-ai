import { BaseTaskAction, TaskAction, TaskActionType } from "Task/task";
import { moveAction } from "./move";
import { findContainerNearSpawn } from "Selectors/spawns";

class DropAction extends BaseTaskAction<StructureSpawn, undefined> {
  type = TaskActionType.DROP;

  action(creep: Creep, ta: TaskAction) {
    // If creep has no energy end task;
    if (creep.store.getUsedCapacity() === 0) return true;

    const id = ta.target as Id<StructureSpawn>;
    const spawn = Game.getObjectById(id);
    if (!ta.moveAction && spawn) {
      const target = findContainerNearSpawn(spawn);
      if (!target) return true;

      ta.moveAction = moveAction.make(target.pos);
    }
    // Move to location and continue only when we are there
    if (ta.moveAction && !moveAction.action(creep, ta.moveAction)) return false;

    if (creep.drop(RESOURCE_ENERGY) !== OK) {
      ta.moveAction = undefined;
      return true; // Unable to build, end task
    }
    return false; // Task is not complete
  }

  make(target: StructureSpawn) {
    return {
      type: this.type,
      target: target.id
    };
  }
}

export const dropAction = new DropAction();
