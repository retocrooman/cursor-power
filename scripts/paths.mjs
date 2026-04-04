import { join } from "node:path";
import { homedir } from "node:os";

const home = homedir();

export const POWER_DIR = join(home, ".cursor-power");
export const TASKS_DIR = join(POWER_DIR, "tasks");
export const QUESTIONS_DIR = join(POWER_DIR, "questions");
export const CONFIG_PATH = join(POWER_DIR, "config.json");
