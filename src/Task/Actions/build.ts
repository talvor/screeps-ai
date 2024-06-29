import { TaskAction, TaskActionType, BaseTaskAction } from "Task/Actions/task-action";
import { moveAction } from "./move";

class BuildAction extends BaseTaskAction<ConstructionSite, undefined> {
  type = TaskActionType.BUILD;

  action(creep: Creep, ta: TaskAction) {
    // If creep has no energy end task;
    if (creep.store.getUsedCapacity() === 0) return true;

    // Move to location and continue only when we are there
    if (ta.moveAction && !moveAction.action(creep, ta.moveAction)) return false;

    const id = ta.target as Id<ConstructionSite>;
    const constructionSite = Game.getObjectById(id);
    if (!constructionSite) {
      console.log(`Build: construction site not found id=${id} creep=${creep.name}`);
      return true;
    }
    const code = creep.build(constructionSite);
    if (code !== OK) {
      if (code === ERR_NOT_IN_RANGE) return true;
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
      moveAction: moveAction.make(target.pos, 3)
    };
  }
  shouldRepeatAction(_creep: Creep, ta: TaskAction): boolean {
    const id = ta.target as Id<ConstructionSite>;
    const constructionSite = Game.getObjectById(id);
    if (!constructionSite) return false;

    return constructionSite.progress !== constructionSite.progressTotal;
  }
}

export const buildAction = new BuildAction();
