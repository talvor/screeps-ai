export function cleanUpCreeps() {
  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      console.log(`Deleting creep ${name}`);
      delete Memory.creeps[name];
    }
  }
}
