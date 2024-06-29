import { TaskAction, TaskActionType, BaseTaskAction } from "Task/Actions/task-action";

class SuicideAction extends BaseTaskAction<undefined, undefined> {
  type = TaskActionType.MOVE;

  action(creep: Creep, _ta: TaskAction) {
    console.log(`SuicideAction: ${creep.name}`);
    creep.suicide();
    return true;
  }
  make(): TaskAction {
    return {
      type: this.type,
      target: undefined
    };
  }
}

export const suicideAction = new SuicideAction();
