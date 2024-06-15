// import { MinionCanWork } from "Tasks/Prerequisites/minion-can-work";
// import { MinionHasEnergy } from "Tasks/Prerequisites/minion-has-energy";
// import { MinionIsNear } from "Tasks/Prerequisites/minion-is-near";
// import { TaskAction } from "Tasks/task";
//
// export class BuildAction extends TaskAction {
//   name = "BuildAction";
//   constructor(private site: ConstructionSite) {
//     super();
//   }
//
//   prereqs = [new MinionCanWork(), new MinionHasEnergy(), new MinionIsNear(this.site.pos, 3)];
//   action(creep: Creep) {
//     if (creep.build(this.site) !== OK) {
//       return true; // Unable to build, end task
//     }
//     return false; // Task is not complete
//   }
//   cost(creep: Creep) {
//     creep.pos.getRangeTo(this.site.pos);
//   }
// }
