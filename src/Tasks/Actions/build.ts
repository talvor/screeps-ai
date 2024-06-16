import { minionCanWork } from "Tasks/Prerequisites/minion-can-work";
import { minionHasEnergy } from "Tasks/Prerequisites/minion-has-energy";
import { minionIsNear } from "Tasks/Prerequisites/minion-is-near";
import { BaseTaskAction, TaskAction, TaskActionType } from "Tasks/task";

class BuildAction extends BaseTaskAction<ConstructionSite, undefined> {
  type = TaskActionType.BUILD;

  action(creep: Creep, ta: TaskAction) {
    const id = ta.target as Id<ConstructionSite>;
    const constructionSite = Game.getObjectById(id);
    if (!constructionSite) {
      console.log(`Build: construction site not found id=${id} creep=${creep.name}`);
      return true;
    }
    const code = creep.build(constructionSite);
    if (code !== OK) {
      if (code === ERR_NOT_ENOUGH_RESOURCES) return true;
      if (constructionSite.progress < constructionSite.progressTotal) return false;
      return true; // Unable to build, end task
    }
    return false; // Task is not complete
  }
  cost(creep: Creep, ta: TaskAction) {
    const id = ta.target as Id<ConstructionSite>;
    const constructionSite = Game.getObjectById(id);
    if (!constructionSite) return Infinity;
    return creep.pos.getRangeTo(constructionSite.pos);
  }

  make(target: ConstructionSite): TaskAction {
    return {
      type: this.type,
      target: target.id,
      prereqs: [minionCanWork.make(), minionHasEnergy.make(), minionIsNear.make(target.pos, 3)]
    };
  }
  isRepeatableComplete(_creep: Creep, ta: TaskAction): boolean {
    const id = ta.target as Id<ConstructionSite>;
    const constructionSite = Game.getObjectById(id);
    if (!constructionSite) return true;

    return constructionSite.progress === constructionSite.progressTotal;
  }
}

export const buildAction = new BuildAction();
