import { findClosestFreeSource } from "Selectors/creeps";
import { BaseTaskAction, TaskAction, TaskActionType } from "Task/task";

type HarvestTarget = StructureContainer | Resource | Source | Ruin;

class ScavengeAction extends BaseTaskAction<undefined, undefined> {
  type = TaskActionType.HARVEST;

  action(creep: Creep, ta: TaskAction) {
    let target: HarvestTarget | null;

    if (!ta.target) {
      target = findClosestFreeSource(creep) || null;
      if (target) {
        ta.target = target.id;
      }
    } else {
      target = Game.getObjectById(ta.target as Id<HarvestTarget>);
    }

    if (target) {
      if (!creep.pos.isNearTo(target)) {
        creep.moveTo(target);
        return false;
      }
    }

    let code;
    if (target instanceof Resource) {
      code = this.tryPickup(creep, ta.target as Id<Resource>);
    } else {
      code = this.tryHarvest(creep, ta.target as Id<Source>);
    }

    if (code === ERR_INVALID_TARGET) {
      const newTarget = findClosestFreeSource(creep);
      if (newTarget) {
        ta.target = newTarget.id;
        return false;
      }
    }

    if (code !== OK) {
      return true; // Unable to harvest, end task
    }
    const full = creep.store.getFreeCapacity() === 0; // Task is not complete if creep still has capacity
    if (full) {
      ta.target = undefined;
    }

    return full;
  }

  tryHarvest(creep: Creep, target: Id<Source>): number {
    const source = Game.getObjectById(target);
    return source ? creep.harvest(source) : ERR_INVALID_TARGET;
  }

  tryPickup(creep: Creep, target: Id<Resource>): number {
    const resource = Game.getObjectById(target);
    return resource ? creep.pickup(resource) : ERR_INVALID_TARGET;
  }

  make(): TaskAction {
    return {
      type: this.type,
      target: undefined
    };
  }
}

export const scavengeAction = new ScavengeAction();
