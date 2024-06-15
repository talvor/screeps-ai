import { logCpu, logCpuStart } from "utils/logCPU";

interface Task {
  name: string;
  fn: () => void;
  mandatory?: boolean;
  runEvery?: number;
  threshold?: number;
}

class TaskManager {
  private lastRun = new Map<string, number>();

  run(tasks: Array<Task>, cpuLimit: number, debug = false) {
    const start = Game.cpu.getUsed();
    if (debug) logCpuStart();
    for (const task of tasks) {
      if (!task.mandatory && Game.cpu.getUsed() - start > cpuLimit) {
        if (debug) console.log(Game.time, "skipping task", task.name);
        continue;
      }
      if (task.threshold && Game.cpu.bucket < task.threshold) {
        if (debug) console.log(Game.time, "skipping task", task.name, "due to low bucket");
        continue;
      }
      if (!task.runEvery || (this.lastRun.get(task.name) ?? 0) + task.runEvery < Game.time) {
        task.fn();
        if (debug) logCpu(task.name);
        // if (debug) console.log(`Running task: ${task.name}`);
        this.lastRun.set(task.name, Game.time);
      }
    }
  }
}

export const taskManager = new TaskManager();
