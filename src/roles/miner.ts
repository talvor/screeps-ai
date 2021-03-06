import { ROLES } from '../constants';
import { RoleBase } from './base';
import { check } from 'utils/errors';
import { deserializePosition, positionEquals, serializePosition } from 'utils/position';
import { buildController } from 'controllers/build';

const ROLE = ROLES.Miner;

export class RoleMiner extends RoleBase {
  public constructor() {
    super(ROLE);
  }

  public run(creep: Creep): boolean {
    try {
      if (!this.is(creep)) return false;

      // Behavior: Find a free Source, go the Container next to it
      // Sit on the Container and mine the Source, until death.

      // the other creeps use 'sId'.
      // sId is ephemoral
      // we use sourceId.
      // sourceId will persist
      // console.log(`${creep} running ${creep.memory.sourceId} ${typeof creep.memory.sourceId}`);

      if (!creep.memory.sourceId) {
        const room = creep.room;
        const list = Object.keys(room.memory.sMiners);

        for (const sId of list) {
          const minerId = room.memory.sMiners[sId];

          // console.log(`is set? ${minerId} - ${Game.getObjectById(minerId)}`);
          // Miner might have died. Check if the id still resolves.
          if (minerId && Game.getObjectById(minerId)) continue;

          room.memory.sMiners[sId] = creep.id;
          creep.memory.sourceId = sId;

          if (this.shouldBuildContainer(room, Game.getObjectById(creep.memory.sourceId) as Source)) {
            creep.say('🏗️ container');
          }
          break;
        }
      }

      let source: Source | undefined;
      if (!creep.memory.isReady) {
        let containerPos;
        if (!creep.memory.pos && creep.memory.sourceId) {
          source = Game.getObjectById(creep.memory.sourceId) as Source;
          const container = source.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: x => {
              return x.structureType === STRUCTURE_CONTAINER;
            }
          });
          if (!container) {
            if (!this.emote(creep, '😟 lost')) {
              // console.log(`${creep} could not find a container near ${source}`);
            }
            return false;
          }
          containerPos = container.pos;
          creep.memory.pos = serializePosition(containerPos);
        } else {
          if (!creep.memory.pos) {
            delete creep.memory.isReady;
            return false;
          }
          containerPos = deserializePosition(creep.memory.pos);
        }
        if (positionEquals(creep.pos, containerPos)) {
          creep.memory.isReady = true;
          delete creep.memory.pos;
        } else {
          this.travelTo(creep, containerPos, '#ffaa00', true);
        }
      }

      if (creep.memory.isReady) {
        if (!source) {
          source = Game.getObjectById(creep.memory.sourceId as string) as Source;
        }
        const code = creep.harvest(source);

        if (code === ERR_NO_BODYPART) {
          // unable to harvest?
          this.suicide(creep);
        } else if (code === ERR_NOT_IN_RANGE) {
          delete creep.memory.sourceId;
        }
        check(creep, `harvest(${source} ${source.pos})`, code);
        return true;
      }
      return false;
    } catch (e) {
      console.log(`ERROR ${creep} ${e.stack}`);
      return false;
    }
  }

  private storeEnergy(creep: Creep): void {
    let structure: Structure[] | Structure = creep.pos.findInRange(FIND_STRUCTURES, 3, {
      filter: s => {
        const type = s.structureType;
        return type === STRUCTURE_STORAGE || type === STRUCTURE_CONTAINER;
      }
    });

    if (!structure.length) {
      console.log(`${creep} ${creep.pos} unable to find storage medium`);
      return;
    }
    structure = structure[0];

    const code = creep.transfer(structure, RESOURCE_ENERGY);

    // this.emote(creep, '🔋charging', code);

    if (code === OK) {
      creep.busy = 1;
    } else if (code === ERR_NO_BODYPART) {
      // unable to energize?
      this.suicide(creep);
    } else if (code === ERR_NOT_IN_RANGE) {
      this.travelTo(creep, structure.pos, '#00FF3C'); // green
    }
  }

  private shouldBuildContainer(room: Room, source: Source): boolean {
    if (room.controller) {
      const pathToController = PathFinder.search(source.pos, room.controller.pos);
      const site = pathToController.path[0];

      const structsAtPos = room.lookForAt(LOOK_STRUCTURES, site);
      const constAtPos = room.lookForAt(LOOK_CONSTRUCTION_SITES, site);

      let okToBuild = false;

      if (!okToBuild && constAtPos[0] && constAtPos[0].structureType !== STRUCTURE_CONTAINER) {
        constAtPos[0].remove();
        okToBuild = true;
      }

      if (!okToBuild && structsAtPos[0] && structsAtPos[0].structureType === STRUCTURE_ROAD) {
        structsAtPos[0].destroy();
        okToBuild = true;
      }

      if (!structsAtPos[0] && !constAtPos[0]) {
        okToBuild = true;
      }

      if (okToBuild) {
        return buildController.schedule(room, STRUCTURE_CONTAINER, site, true);
      }
      return false;
    }

    return false;
  }
}

export const roleMiner = new RoleMiner();
