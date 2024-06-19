import { minionCanCarry } from "Tasks/Prerequisites/minion-can-carry";
import { minionCanWork } from "Tasks/Prerequisites/minion-can-work";
import { minionIsNear } from "Tasks/Prerequisites/minion-is-near";
import { BaseTaskAction, TaskAction, TaskActionType } from "Tasks/task";

class HarvestAction extends BaseTaskAction<Source, undefined> {
  type = TaskActionType.HARVEST;

  action(creep: Creep, ta: TaskAction) {
    const target = Game.getObjectById(ta.target as Id<StructureContainer | Resource | Source>);
    if (target) {
      if (!creep.pos.isNearTo(target)) {
        creep.moveTo(target);
        return false;
      }
    }
    let code = this.tryWithdraw(creep, ta.target as Id<StructureContainer>);
    if (code !== OK) {
      code = this.tryPickup(creep, ta.target as Id<Resource>);
    }
    if (code !== OK) {
      code = this.tryHarvest(creep, ta.target as Id<Source>);
    }

    if (code !== OK) {
      return true; // Unable to harvest, end task
    }
    return creep.store.getFreeCapacity() === 0; // Task is not complete if creep still has capacity
  }

  tryHarvest(creep: Creep, target: Id<Source>): number {
    const source = Game.getObjectById(target);
    return source ? creep.harvest(source) : ERR_INVALID_TARGET;
  }

  tryPickup(creep: Creep, target: Id<Resource>): number {
    const resource = Game.getObjectById(target);
    return resource ? creep.pickup(resource) : ERR_INVALID_TARGET;
  }

  tryWithdraw(creep: Creep, target: Id<StructureContainer>): number {
    const structure = Game.getObjectById(target);
    return structure ? creep.withdraw(structure, RESOURCE_ENERGY) : ERR_INVALID_TARGET;
  }

  make(target: Source | Resource | StructureContainer | Tombstone): TaskAction {
    return {
      type: this.type,
      target: target.id,
      prereqs: [minionCanWork.make(), minionCanCarry.make(), minionIsNear.make(target.pos, 1)]
    };
  }
}

export const harvestAction = new HarvestAction();
