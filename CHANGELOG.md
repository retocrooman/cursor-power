# Changelog

## 0.2.0 (2026-04-04)

### Features

- add /release command for automated versioning and publishing
- implement PR review flow with /task-review
- implement Phase 3 — task cleanup with /task-clean
- background worker execution with detached spawn
- implement Phase 1 — task add, list, status with worker orchestration

### Bug Fixes

- move /release command to project-local .cursor/commands

### Refactoring

- move release tooling into .cursor/ (gitignored)
- centralize child agent prompts in prompt.mjs

### Documentation

- add Phase 3 test section to README
- add contribution section to README
- add initial project documentation

### Other

- finalize Phase 4 — npm package ready for global install
- Merge pull request #5 from retocrooman/task-50aa595a
- add gitignore for node_modules and .cursor
- Merge pull request #1 from retocrooman/task-7d374442
- add MVP verification section

