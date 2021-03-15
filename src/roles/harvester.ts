import { ROLES, STORAGE_MINIMUM } from '../constants';

import { RoleBase } from './base';
import { phaseController } from 'controllers/phase';
import { structLink } from 'structures/link';
import { timeStamp } from 'console';

const ROLE = ROLES.Harvester;

export class RoleHarvester extends RoleBase {
  public constructor() {
    super(ROLE);
  }

  public run(creep: Creep): boolean {
    if (creep.busy || !this.is(creep)) return false;

    if (!creep.memory.full) {
      this.harvest(creep);
    } else {
      this.recharge(creep);
    }
    return true;
  }

  public harvest(creep: Creep): StructureLink | StructureStorage | StructureContainer | Source | undefined {
    let source: StructureLink | StructureStorage | StructureContainer | Source | undefined;

    if (creep.busy) return;

    if (creep.memory.cId) {
      if (creep.store.energy) {
        this.build(creep);
        return;
      } else {
        delete creep.memory.cId;
      }
    }

    if (creep.memory.sId) {
      source = Game.getObjectById(creep.memory.sId) as StructureStorage | StructureContainer | Source;
    }

    if (!source) {
      if (phaseController.getCurrentPhaseNumber(creep.room) >= 4) {
        const link = structLink.findLinkForHarvester(creep);
        if (link) {
          if (!Memory.links[link.id].isStorageLink) {
            // Find closest Container then source
            source = link.pos.findClosestByPath(FIND_STRUCTURES, {
              filter: s => s.structureType === 'container'
            }) as StructureContainer;

            if (!source || source.store.getUsedCapacity() < STORAGE_MINIMUM) {
              source = link.pos.findClosestByPath(FIND_SOURCES) as Source;
            }
          } else {
            source = link;
          }
        }
        if (!source) {
          source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE) as Source;
        }
      } else {
        source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: s => s.structureType === 'container' && s.store.getUsedCapacity() > STORAGE_MINIMUM
        }) as StructureContainer;

        if (!source) {
          source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE) as Source;
        }
      }
    }
    if (source) {
      creep.memory.sId = source.id;
      let code;

      if (source instanceof Source || source instanceof Mineral) {
        code = creep.harvest(source);
      } else {
        code = creep.withdraw(source, RESOURCE_ENERGY);
      }

      this.emote(creep, '🔄 harvest', code);

      if (code === OK) {
        delete creep.memory.sId;
      } else if (code === ERR_NOT_IN_RANGE) {
        // code = this.travelTo(creep, source, '#ffaa00', creep.memory.noRoads || opts.notBuildRoads); // orange
        code = this.travelTo(creep, source, '#ffaa00'); // orange
        // What about using Storage???
      } else if (code === ERR_NOT_ENOUGH_RESOURCES) {
        delete creep.memory.sId;
      } else if (code === ERR_NO_BODYPART) {
        // unable to harvest?
        this.suicide(creep);
      }
    } else if (!creep.busy && this.emote(creep, '😰 No Srcs')) {
      console.log(`${creep} at ${creep.pos} could not find any available sources`);
    }
    creep.busy = 1;
    return source;
  }

  public recharge(creep: Creep): void {
    let structure:
      | StructureExtension
      | StructureSpawn
      | StructureTower
      | StructureContainer
      | StructureStorage
      | StructureLink
      | undefined;
    if (creep.memory.rechargeId) {
      structure = Game.getObjectById(creep.memory.rechargeId) as StructureExtension | StructureSpawn | StructureTower;
      // | StructureContainer;

      if (!structure.store.getFreeCapacity()) {
        structure = undefined;
        delete creep.memory.rechargeId;
      }
    }

    if (!structure) {
      if (phaseController.getCurrentPhaseNumber(creep.room) >= 4) {
        const source = structLink.findLinkForHarvester(creep);
        if (source) {
          const link = Memory.links[source.id];
          if (link.isStorageLink) {
            structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
              filter: s => {
                return (
                  (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) &&
                  s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                );
              }
            }) as StructureExtension | StructureSpawn;
          } else {
            structure = source;
          }
        }

        if (!structure) {
          structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: s => {
              return (
                (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) &&
                s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
              );
            }
          }) as StructureExtension | StructureSpawn;
        }
      } else {
        structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
          filter: s => {
            return (
              (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) &&
              s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            );
          }
        }) as StructureExtension | StructureSpawn;

        if (!structure) {
          // if things do not need to be recharged, fill up storage.
          structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          }) as StructureTower;
        }
      }
      // if (!structure) {
      //   // if things do not need to be recharged, fill up storage.
      //   structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      //     filter: s => s.structureType === STRUCTURE_STORAGE && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      //   }) as StructureStorage;
      // }

      if (!structure && creep.room.memory.storageId) {
        // if things do not need to be recharged, fill up storage.
        structure = Game.getObjectById(creep.room.memory.storageId) as StructureStorage;
      }
    }

    if (structure && structure.store) {
      creep.memory.rechargeId = structure.id;
      const code = creep.transfer(structure, RESOURCE_ENERGY);

      this.emote(creep, '🔋charging', code, [OK, ERR_NOT_IN_RANGE, ERR_FULL]);

      if (code === OK) {
        creep.busy = 1;
      } else if (code === ERR_NO_BODYPART) {
        // unable to energize?
        this.suicide(creep);
      } else if (code === ERR_NOT_IN_RANGE) {
        this.travelTo(creep, structure.pos, '#00FF3C'); // green
      } else if (code === ERR_FULL) {
        delete creep.memory.rechargeId;
      }
    } else {
      if (creep.store.getFreeCapacity() > 0) {
        delete creep.memory.full;
        delete creep.memory.rechargeId;
        this.harvest(creep);
      } else {
        if (!this.build(creep)) {
          this.waitAtFlag(creep);
        }
      }
    }
  }
}

export const roleHarvester = new RoleHarvester();
