import { link } from 'fs';

export const cityEdges = { n: -5, e: 5, s: 5, w: -5 };
export const cityMap: CityMap = [
  {
    rcl: '1',
    buildings: { spawn: { pos: [{ x: 5, y: 5 }] } }
  },
  {
    rcl: '2',
    buildings: {
      extension: {
        pos: [
          { x: 7, y: 4 },
          { x: 9, y: 4 },
          { x: 8, y: 5 },
          { x: 7, y: 6 },
          { x: 9, y: 6 }
        ]
      },
      spawn: { pos: [{ x: 5, y: 5 }] }
    },
    additional: (room: Room): CityMapBuildings => {
      if (room.controller) {
        const controller = room.controller;
        const sources = room.find(FIND_SOURCES);

        const containerPositions: IPosition[] = [];

        _.forEach(sources, source => {
          const pathToController = PathFinder.search(source.pos, controller.pos);
          const site = pathToController.path[0];

          containerPositions.push({ x: site.x, y: site.y });
        });

        return { [STRUCTURE_CONTAINER]: { pos: containerPositions } };
      }
      return {};
    }
  },
  {
    rcl: '3',
    buildings: {
      extension: {
        pos: [
          { x: 4, y: 1 },
          { x: 6, y: 1 },
          { x: 5, y: 2 },
          { x: 4, y: 3 },
          { x: 6, y: 3 },
          { x: 7, y: 4 },
          { x: 9, y: 4 },
          { x: 8, y: 5 },
          { x: 7, y: 6 },
          { x: 9, y: 6 }
        ]
      },
      tower: { pos: [{ x: 5, y: 0 }] },
      spawn: { pos: [{ x: 5, y: 5 }] }
    },
    additional: (room: Room): CityMapBuildings => {
      if (room.controller) {
        const controller = room.controller;
        const sources = room.find(FIND_SOURCES);

        const containerPositions: IPosition[] = [];

        _.forEach(sources, source => {
          const pathToController = PathFinder.search(source.pos, controller.pos);
          const site = pathToController.path[0];

          containerPositions.push({ x: site.x, y: site.y });
        });

        return { [STRUCTURE_CONTAINER]: { pos: containerPositions } };
      }
      return {};
    }
  },
  {
    rcl: '4',
    buildings: {
      extension: {
        pos: [
          { x: 4, y: 1 },
          { x: 6, y: 1 },
          { x: 5, y: 2 },
          { x: 4, y: 3 },
          { x: 6, y: 3 },
          { x: 1, y: 4 },
          { x: 3, y: 4 },
          { x: 7, y: 4 },
          { x: 9, y: 4 },
          { x: 2, y: 5 },
          { x: 8, y: 5 },
          { x: 1, y: 6 },
          { x: 3, y: 6 },
          { x: 7, y: 6 },
          { x: 9, y: 6 },
          { x: 4, y: 7 },
          { x: 6, y: 7 },
          { x: 5, y: 8 },
          { x: 4, y: 9 },
          { x: 6, y: 9 }
        ]
      },
      tower: { pos: [{ x: 5, y: 0 }] },
      storage: { pos: [{ x: 10, y: 5 }] },
      spawn: { pos: [{ x: 5, y: 5 }] }
    },
    additional: (room: Room): CityMapBuildings => {
      if (room.controller) {
        const controller = room.controller;
        const sources = room.find(FIND_SOURCES);

        const containerPositions: IPosition[] = [];

        _.forEach(sources, source => {
          const pathToController = PathFinder.search(source.pos, controller.pos);
          const site = pathToController.path[0];

          containerPositions.push({ x: site.x, y: site.y });
        });

        return { [STRUCTURE_CONTAINER]: { pos: containerPositions } };
      }
      return {};
    }
  },
  {
    rcl: '5',
    buildings: {
      tower: {
        pos: [
          { x: 5, y: 0 },
          { x: 5, y: 10 }
        ]
      },
      extension: {
        pos: [
          { x: 4, y: 1 },
          { x: 6, y: 1 },
          { x: 8, y: 1 },
          { x: 3, y: 2 },
          { x: 5, y: 2 },
          { x: 7, y: 2 },
          { x: 9, y: 2 },
          { x: 2, y: 3 },
          { x: 4, y: 3 },
          { x: 6, y: 3 },
          { x: 8, y: 3 },
          { x: 1, y: 4 },
          { x: 3, y: 4 },
          { x: 7, y: 4 },
          { x: 9, y: 4 },
          { x: 2, y: 5 },
          { x: 8, y: 5 },
          { x: 1, y: 6 },
          { x: 3, y: 6 },
          { x: 7, y: 6 },
          { x: 9, y: 6 },
          { x: 2, y: 7 },
          { x: 4, y: 7 },
          { x: 6, y: 7 },
          { x: 8, y: 7 },
          { x: 3, y: 8 },
          { x: 5, y: 8 },
          { x: 7, y: 8 },
          { x: 4, y: 9 },
          { x: 6, y: 9 }
        ]
      },
      spawn: { pos: [{ x: 5, y: 5 }] },
      storage: { pos: [{ x: 10, y: 5 }] },
      link: { pos: [{ x: 11, y: 5 }] }
    },
    additional: (room: Room): CityMapBuildings => {
      if (room.controller) {
        const controller = room.controller;
        // We need a container per source
        const sources = room.find(FIND_SOURCES);

        const containerPositions: IPosition[] = [];
        const linkPositions: IPosition[] = [];

        _.forEach(sources, (source, index) => {
          const pathToController = PathFinder.search(source.pos, controller.pos);
          const site = pathToController.path[0];
          const site2 = pathToController.path[1];

          containerPositions.push({ x: site.x, y: site.y });
          if (index === 0) {
            linkPositions.push({ x: site2.x, y: site2.y });
          }
        });
        return { [STRUCTURE_CONTAINER]: { pos: containerPositions }, [STRUCTURE_LINK]: { pos: linkPositions } };
      }
      return {};
    }
  },
  {
    rcl: '6',
    buildings: {
      tower: {
        pos: [
          { x: 5, y: 0 },
          { x: 5, y: 10 }
        ]
      },
      extension: {
        pos: [
          { x: 4, y: 1 },
          { x: 6, y: 1 },
          { x: 8, y: 1 },
          { x: 3, y: 2 },
          { x: 5, y: 2 },
          { x: 7, y: 2 },
          { x: 9, y: 2 },
          { x: 2, y: 3 },
          { x: 4, y: 3 },
          { x: 6, y: 3 },
          { x: 8, y: 3 },
          { x: 1, y: 4 },
          { x: 3, y: 4 },
          { x: 7, y: 4 },
          { x: 9, y: 4 },
          { x: 2, y: 5 },
          { x: 8, y: 5 },
          { x: 1, y: 6 },
          { x: 3, y: 6 },
          { x: 7, y: 6 },
          { x: 9, y: 6 },
          { x: 2, y: 7 },
          { x: 4, y: 7 },
          { x: 6, y: 7 },
          { x: 8, y: 7 },
          { x: 3, y: 8 },
          { x: 5, y: 8 },
          { x: 7, y: 8 },
          { x: 4, y: 9 },
          { x: 6, y: 9 }
        ]
      },
      spawn: { pos: [{ x: 5, y: 5 }] },
      storage: { pos: [{ x: 10, y: 5 }] },
      link: { pos: [{ x: 11, y: 5 }] }
    },
    additional: (room: Room): CityMapBuildings => {
      if (room.controller) {
        const controller = room.controller;
        // We need a container per source and link per container
        const sources = room.find(FIND_SOURCES);

        const containerPositions: IPosition[] = [];
        const linkPositions: IPosition[] = [];

        _.forEach(sources, source => {
          const pathToController = PathFinder.search(source.pos, controller.pos);
          const site = pathToController.path[0];
          const site2 = pathToController.path[1];

          containerPositions.push({ x: site.x, y: site.y });
          linkPositions.push({ x: site2.x, y: site2.y });
        });

        return { [STRUCTURE_CONTAINER]: { pos: containerPositions }, [STRUCTURE_LINK]: { pos: linkPositions } };
      }
      return {};
    }
  }
];

function calcBuildingDelta(buildings: CityMapBuildings): CityMapBuildings {
  const result: CityMapBuildings = {};
  const spawnPos = buildings[STRUCTURE_SPAWN]?.pos[0];
  if (spawnPos) {
    for (const key in buildings) {
      if (Object.prototype.hasOwnProperty.call(buildings, key)) {
        if (key !== STRUCTURE_SPAWN) {
          const element = buildings[key as BuildableStructureConstant];
          result[key as BuildableStructureConstant] = {
            pos: element?.pos.map(pos => {
              return { x: pos.x - spawnPos.x, y: pos.y - spawnPos.y };
            }) as IPosition[]
          };
        }
      }
    }
  }
  return result;
}

export const getCityMapForRCL = (level: number): ICityMapLevel | undefined => {
  let num = level;
  let cityLevel;
  do {
    cityLevel = cityMap.find(c => c.rcl === num.toString());
    num--;
    if (num < 0) {
      throw new Error(`CityMap does not exist for phase ${level}`);
    }
  } while (!cityLevel);

  if (cityLevel) {
    return _.merge({}, cityLevel, { buildings: calcBuildingDelta(cityLevel.buildings) });
  }

  return undefined;
};
