import { constants } from 'http2';

export enum ROLES {
  Harvester = 'Harvester',
  Upgrader = 'Upgrader',
  Builder = 'Builder'
}

export const EXIT_NAME = {
  [FIND_EXIT_TOP]: 'FIND_EXIT_TOP',
  [FIND_EXIT_LEFT]: 'FIND_EXIT_LEFT',
  [FIND_EXIT_BOTTOM]: 'FIND_EXIT_BOTTOM',
  [FIND_EXIT_RIGHT]: 'FIND_EXIT_RIGHT'
};

export const EXITS = [FIND_EXIT_TOP, FIND_EXIT_RIGHT, FIND_EXIT_BOTTOM, FIND_EXIT_LEFT];
