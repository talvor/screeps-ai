import { AVOID_LIST } from 'utils/Avoid';

import { StructBase } from './base';

function rangeFromController(source: Source) {
  let range = -1;
  if (source.room.controller) {
    let res;

    try {
      res = PathFinder.search(source.pos, source.room.controller.pos);
    } catch (ex) {
      console.log(`rangeFromController failed for Source[${source}]: ${ex.message}.${ex.stack}`);
    }
    if (res && res.path && res.path.length !== undefined) {
      range = res.path.length;
    }
  }
  return range;
}
export class StructExtension extends StructBase {
  public constructor() {
    super(STRUCTURE_EXTENSION, {
      minFreeAdjSpaces: 3,
      minPlacementDistance: 1,
      avoidList: [
        // avoid roads as they represent high traffic
        // areas and will get in the creeps' way.
        AVOID_LIST[STRUCTURE_ROAD],
        AVOID_LIST[STRUCTURE_SPAWN],
        AVOID_LIST[STRUCTURE_CONTROLLER],
        AVOID_LIST[STRUCTURE_EXTENSION],
        AVOID_LIST[STRUCTURE_CONTAINER],
        AVOID_LIST[STRUCTURE_STORAGE],
        AVOID_LIST[LOOK_SOURCES]
      ],
      avoidIsCheckered: true
    });
  }

  public *getBuildingPointsOfInterests(room: Room) {
    yield* super.getBuildingPointsOfInterests(room, StructExtension.sortPoiMethod);
  }

  public static sortPoiMethod(a: Source, b: Source): number {
    return rangeFromController(a) - rangeFromController(b);
  }
}

export const structExtension = new StructExtension();
