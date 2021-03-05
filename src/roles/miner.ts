import { ROLES } from '../constants';
import { RoleBase } from './base';
import { check } from 'utils/errors';
import { deserializePosition, positionEquals, serializePosition } from 'utils/position';

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
          containerPos = deserializePosition(creep.memory.pos as string);
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

  public gc(): void {}
}

export const roleMiner = new RoleMiner();
