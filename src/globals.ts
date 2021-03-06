import { cityEdges, getCityMapForRCL } from './config/cityMap';
import { ErrorMapper } from 'utils/ErrorMapper';
import { roomController } from 'controllers/room';

global.findCityArea = function (roomName: string): void {
  const room = Game.rooms[roomName];
  const spawn = room.find(FIND_MY_SPAWNS)[0];

  if (!spawn) {
    console.log('Room has no spawn');
    return;
  }

  const spawnPos = spawn.pos;
  const cityBounds: IBounds = {
    nw: { x: spawnPos.x + cityEdges.w, y: spawnPos.y + cityEdges.n },
    ne: { x: spawnPos.x + cityEdges.e, y: spawnPos.y + cityEdges.n },
    sw: { x: spawnPos.x + cityEdges.w, y: spawnPos.y + cityEdges.s },
    se: { x: spawnPos.x + cityEdges.e, y: spawnPos.y + cityEdges.s }
  };

  const areaTerrain = room.lookForAtArea(
    LOOK_TERRAIN,
    cityBounds.ne.y,
    cityBounds.nw.x,
    cityBounds.sw.y,
    cityBounds.se.x,
    true
  );
  console.log(`cityBounds = ${JSON.stringify(cityBounds)}`);
  console.log(`areaTerrain = ${JSON.stringify(areaTerrain)}`);
};

global.getCityMap = function (rcl: number): ICityMapLevel {
  return getCityMapForRCL(rcl) as ICityMapLevel;
};

global.checkMap = function (roomName: string): void {
  try {
    return roomController.checkCityMap(Game.rooms[roomName]);
  } catch (err) {
    console.log(`<span style='color:red'>${_.escape(ErrorMapper.sourceMappedStackTrace(err))}</span>`);
  }
};
