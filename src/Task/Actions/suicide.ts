import { TaskAction, TaskActionType, BaseTaskAction } from "Task/Actions/task-action";

class SuicideAction extends BaseTaskAction<undefined, undefined> {
  type = TaskActionType.SUICIDE;

  action(creep: Creep, _ta: TaskAction) {
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
