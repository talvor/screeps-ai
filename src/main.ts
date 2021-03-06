import './globals';

import { ErrorMapper } from 'utils/ErrorMapper';
import { gameController } from 'controllers/game';

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  gameController.preRun();

  gameController.run();

  gameController.postRun();
});
