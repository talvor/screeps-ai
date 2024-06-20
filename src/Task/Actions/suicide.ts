import { BaseTaskAction, TaskAction, TaskActionType } from "Task/task";

class SuicideAction extends BaseTaskAction<undefined, undefined> {
  type = TaskActionType.MOVE;

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
