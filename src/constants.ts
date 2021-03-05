export enum ROLES {
  Harvester = 'Harvester',
  Upgrader = 'Upgrader',
  Builder = 'Builder',
  Miner = 'Miner'
}

export const EXIT_NAME = {
  [FIND_EXIT_TOP]: 'FIND_EXIT_TOP',
  [FIND_EXIT_LEFT]: 'FIND_EXIT_LEFT',
  [FIND_EXIT_BOTTOM]: 'FIND_EXIT_BOTTOM',
  [FIND_EXIT_RIGHT]: 'FIND_EXIT_RIGHT'
};

export const EXITS = [FIND_EXIT_TOP, FIND_EXIT_RIGHT, FIND_EXIT_BOTTOM, FIND_EXIT_LEFT];

export const ORDER_STRUCTURES: BuildableStructureConstant[] = [
  STRUCTURE_SPAWN,
  STRUCTURE_STORAGE,
  STRUCTURE_TOWER,
  STRUCTURE_EXTENSION,
  STRUCTURE_CONTAINER,
  STRUCTURE_LINK,
  STRUCTURE_WALL,
  STRUCTURE_EXTRACTOR,
  STRUCTURE_TERMINAL,
  STRUCTURE_LAB,
  STRUCTURE_RAMPART,
  STRUCTURE_OBSERVER,
  STRUCTURE_NUKER,
  STRUCTURE_POWER_SPAWN,
  STRUCTURE_ROAD
];

export const ROOM_LEVEL: IRoomLevel = {
  0: { containerRange: 1 },
  1: { containerRange: 1 },
  2: { containerRange: 1, extensionRange: 5 },
  3: { containerRange: 1, extensionRange: 5, towerRange: 5 },
  4: { containerRange: 1, extensionRange: 8, towerRange: 5, storageRange: 5 },
  5: { containerRange: 1, extensionRange: 8, towerRange: 5, storageRange: 5 },
  6: { containerRange: 1, extensionRange: 11, towerRange: 5, storageRange: 5 },
  7: { containerRange: 1, extensionRange: 11, towerRange: 5, storageRange: 5, spawnRange: 13 },
  8: { containerRange: 1, extensionRange: 11, towerRange: 15, storageRange: 5, spawnRange: 13 }
};
