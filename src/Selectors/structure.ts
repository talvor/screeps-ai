import { healthRatio } from "utils/heath-ratio";

export const findConstructionSitesInRoom = (room: Room): Array<ConstructionSite> => {
  return room.find(FIND_MY_CONSTRUCTION_SITES);
};

export const findExtensionsInRoom = (
  room: Room,
  filterFn?: (extension: StructureExtension) => boolean
): Array<StructureExtension> => {
  const extensions = room.find<StructureExtension>(FIND_MY_STRUCTURES, {
    filter: { structureType: STRUCTURE_EXTENSION }
  });
  if (!filterFn) return extensions;
  return extensions.filter(filterFn);
};

export const findTowersInRoom = (room: Room, filterFn?: (tower: StructureTower) => boolean): Array<StructureTower> => {
  const towers = room.find<StructureTower>(FIND_MY_STRUCTURES, {
    filter: { structureType: STRUCTURE_TOWER }
  });
  if (!filterFn) return towers;
  return towers.filter(filterFn);
};

export const findStructuresNeedingRepair = (room: Room, repairThreshold = 0.5): Array<Structure> => {
  const structures = room.find(FIND_STRUCTURES, {
    filter: s => {
      const damage = s.hitsMax - s.hits;
      const perc = damage / s.hitsMax;
      return perc < repairThreshold;
    }
  });
  return structures;
};

export const findContainersNearPosition = (pos: RoomPosition, distance: number): Array<StructureContainer> => {
  const containerNearPos = pos.findInRange<FIND_STRUCTURES, StructureContainer>(FIND_STRUCTURES, distance, {
    filter: s => s.structureType === STRUCTURE_CONTAINER
  })[0];
  return [containerNearPos];
};

const _lowHealthStructs: { [key: string]: AnyStructure[] } = {};

export const findLowHealthStructure = (
  room: Room | RoomPosition | string,
  structureThreshold: number,
  roadThreshold = 0.5
): AnyStructure | undefined => {
  // accept Room Object, RoomPosition Object, String
  const roomName = (room as Room).name || (room as RoomPosition).roomName || (room as string);
  room = Game.rooms[roomName];

  if (!_lowHealthStructs[roomName]) {
    const lowHealthBuildings = room.find<AnyStructure>(FIND_STRUCTURES, {
      filter: (s: AnyStructure | StructureWall | StructureRampart) => {
        if (!s.hits || !s.hitsMax) return false;
        if (s.structureType === STRUCTURE_ROAD) return false;
        if (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) return false;

        const ratio = healthRatio(s.hits, s.hitsMax);
        return ratio < structureThreshold;
      }
    });

    const lowHeathRoads = room.find<AnyStructure>(FIND_STRUCTURES, {
      filter: (s: AnyStructure | StructureWall | StructureRampart) => {
        if (!s.hits || !s.hitsMax) return false;
        if (s.structureType !== STRUCTURE_ROAD) return false;

        const ratio = healthRatio(s.hits, s.hitsMax);

        return ratio < roadThreshold;
      }
    });
    _lowHealthStructs[roomName] = lowHealthBuildings.length ? lowHealthBuildings : lowHeathRoads;
  }

  if (!_lowHealthStructs[roomName] || _lowHealthStructs[roomName].length === 0) return;
  _lowHealthStructs[roomName].sort((a, b) => healthRatio(a.hits, b.hitsMax) - healthRatio(b.hits, b.hitsMax));
  return _lowHealthStructs[roomName].pop();
};
