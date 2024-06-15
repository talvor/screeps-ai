import { ErrorMapper } from "utils/ErrorMapper";

import { gameController } from "Controllers/game";
import { testDistanceTransform, toggleSetting } from "globals/utilities";
import { taskSupervisor } from "Supervisors/task";

global.utils = {
  toggleSetting: toggleSetting,
  distanceTransform: testDistanceTransform,
  taskSupervisor: taskSupervisor
};

export const loop = ErrorMapper.wrapLoop(() => {
  gameController.run();
});
