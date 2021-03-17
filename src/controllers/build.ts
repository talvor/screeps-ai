import { deserializePosition, serializePosition } from 'utils/position';

import { ORDER_STRUCTURES } from '../constants';
import { check } from 'utils/errors';

const CONSTRUCTION_SITES_PER_ROOM_LIMIT = 4;
const EXISTING_CONSTRUCTION_SITE_THRESHOLD = 95;
const CONSTRUCTION_SITE_LIMIT = 100;

function priorityStructureSort(a: IBuildOrder, b: IBuildOrder) {
  if (ORDER_STRUCTURES.indexOf(a.type) === ORDER_STRUCTURES.indexOf(b.type)) {
    // "queue" helps maintain a FIFO among the same type.
    // this is particularly useful for something like building a road!
    return (a.queue || 0) - (b.queue || 0);
  }
  return ORDER_STRUCTURES.indexOf(a.type) - ORDER_STRUCTURES.indexOf(b.type);
}

let _constructionSites: {
  [key: string]: ConstructionSite[];
} = {};
let _howmanySites = 0;

function _buildConstructionSiteCache(room: Room) {
  const roomName = room.name;
  _constructionSites[roomName] = room.find(FIND_MY_CONSTRUCTION_SITES);
  _howmanySites = _constructionSites[roomName].length;
}

export class BuildController {
  public preRun(): void {
    if (!Memory.con) Memory.con = {};
  }

  public schedule(room: Room, type: BuildableStructureConstant, _pos: RoomPosition, priorityBuild = false): boolean {
    // schedule does not check if _pos is occupied.
    // caller should do this, before calling this method

    const orders = Memory.con[room.name] || [];
    const pos = serializePosition(_pos);
    const result = this.getScheduledAt(room, _pos);

    if (result && result.type === type) {
      return true;
    } else if (result && result.type === STRUCTURE_ROAD) {
      console.log(`${_pos} replacing planned road with a planned ${type}`);
      result.type = type;
      orders.sort(priorityStructureSort);

      return true;
    } else if (result) {
      // something else is built here.
      console.log(`${_pos} cannot schedule ${type}; ${result.type} already scheduled here`);
      return false;
    }

    // otherwise, nothing is here. Schedule the build.
    Memory.buildOrderCount = Memory.buildOrderCount || 1;
    orders.push({ type, pos, queue: priorityBuild ? 0 : Memory.buildOrderCount++ });
    orders.sort(priorityStructureSort);

    Memory.con[room.name] = orders;
    return true;
  }

  public getCount(_room: Room | string, filter: FilterFunction<FindConstant> | FilterObject): number {
    const roomName = (_room as Room).name || (_room as string); // accept either Room Object or String
    const orders = Memory.con[roomName] || [];
    let res = orders.map(x => ({ structureType: x.type }));

    res = _.filter(res, filter);

    // console.log(type + ' ' + orders.length + ' ' + res.length);
    return res.length;
  }

  private getScheduledAt(room: Room, _pos: RoomPosition, type?: string): IBuildOrder | undefined {
    // type is optional
    const orders = Memory.con[room.name] || [];
    const pos = serializePosition(_pos);
    const result = orders.find(x => x.pos === pos) as IBuildOrder;
    if (type === undefined || type === result.type) {
      return result;
    }
    return undefined;
  }

  public getAllScheduled(_room: Room | string): BuildOrder[] {
    const roomName = (_room as Room).name || (_room as string); // accept either Room Object or String
    const orders = Memory.con[roomName] || [];
    return orders.map(x => ({
      type: x.type,
      pos: deserializePosition(x.pos as string)
    }));
  }

  public getNextBuildOrder(_room: Room | string): BuildOrder | undefined {
    const roomName = (_room as Room).name || (_room as string); // accept either Room Object or String
    const orders = Memory.con[roomName] || [];
    if (orders.length) {
      orders.sort(priorityStructureSort);
      const order = orders.shift();
      orders.sort(priorityStructureSort);
      Memory.con[roomName] = orders;
      if (order) {
        return {
          type: order.type,
          pos: deserializePosition(order.pos as string)
        };
      }
    }
    return;
  }

  private countAllConstructionSites(_room: Room | string): number {
    const roomName = (_room as Room).name || (_room as string);
    const room = Game.rooms[roomName];
    if (!_howmanySites) {
      _buildConstructionSiteCache(room);
    }
    return _howmanySites;
  }

  private getConstructionSites(_room: Room | string): ConstructionSite[] {
    const roomName = (_room as Room).name || (_room as string);
    const room = Game.rooms[roomName];

    if (!_constructionSites[roomName]) {
      _buildConstructionSiteCache(room);
    }

    return _constructionSites[roomName] || [];
  }

  public execute(room: Room): number | undefined {
    if (!Memory.con[room.name] || !Memory.con[room.name].length) return;

    // check max number of constucture sites
    // are there enough build orders right now?
    const siteCount = this.countAllConstructionSites(room);
    const mySites = this.getConstructionSites(room);
    if (siteCount >= EXISTING_CONSTRUCTION_SITE_THRESHOLD || mySites.length >= CONSTRUCTION_SITES_PER_ROOM_LIMIT) {
      return 0;
    }

    const orders = Memory.con[room.name];
    let howmany = 0;

    while (
      siteCount + howmany < CONSTRUCTION_SITE_LIMIT &&
      mySites.length + howmany < CONSTRUCTION_SITES_PER_ROOM_LIMIT
    ) {
      if (!orders || !orders.length) break;

      let code;
      const { type, pos } = orders.shift() as IBuildOrder;

      console.log(`BuildController.execute type=${type} pos=${pos}`);
      const roomPos = deserializePosition(pos as string);

      const roomName = roomPos.roomName;
      const _room = Game.rooms[roomName];
      if (_room) {
        code = _room.createConstructionSite(roomPos, type);
        check(roomPos, `createConstructionSite(${type})`, code);

        if (code === OK) {
          howmany++;
          // building an unwalkable thing, remove a road if it exists
          // @ts-ignore
          const res = room.lookAt(roomPos).find(x => x.type === STRUCTURE_ROAD);
          if (res) {
            // we don't dismantle (yet), because you need at least 4 WORK
            // parts to get back 1 energy, because you reclaim 0.25 energies
            // for each part, and then energies are rounded down.
            res?.structure?.destroy();
          }
        } else if (code === ERR_FULL || code === ERR_RCL_NOT_ENOUGH) {
          // unable to fullfill order, but can in the future, reschedule
          orders.unshift({ type, pos: serializePosition(roomPos) });
          if (code === ERR_FULL) break;
        } else {
          console.log(`buildController.execute code=${code}`);
        }
      } else {
        console.log(`${roomPos} Abandoning planned ${type}. Room is not visible.`);
      }
    }
    return howmany;
  }

  public gc(): void {
    _constructionSites = {};
    _howmanySites = 0;
  }
}

export const buildController = new BuildController();
