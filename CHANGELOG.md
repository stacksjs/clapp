[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.11...v0.2.12)

## 🐛 Bug Fixes

- **command**: dedupe overridden global options in help ([ccc00e1](https://github.com/stacksjs/clapp/commit/ccc00e1)) _(by Chris <chrisbreuer93@gmail.com>)_

## 🧹 Chores

- release v0.2.12 ([9c96a98](https://github.com/stacksjs/clapp/commit/9c96a98)) _(by Chris <chrisbreuer93@gmail.com>)_
- adjust deps ([7280ff4](https://github.com/stacksjs/clapp/commit/7280ff4)) _(by Chris <chrisbreuer93@gmail.com>)_
- adjust configs ([3ee7026](https://github.com/stacksjs/clapp/commit/3ee7026)) _(by Chris <chrisbreuer93@gmail.com>)_

## Contributors

- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.10...v0.2.11)

## 🚀 Features

- **cli**: dispatch space-separated colon command invocation ([9e971d1](https://github.com/stacksjs/clapp/commit/9e971d1)) _(by Chris <chrisbreuer93@gmail.com>)_
- **cli**: add isClappError guard and optional usage line to ClappError ([da97007](https://github.com/stacksjs/clapp/commit/da97007)) _(by Chris <chrisbreuer93@gmail.com>)_

## 🐛 Bug Fixes

- **command**: replace per-command help re-listing with compact hint ([fbbc1a5](https://github.com/stacksjs/clapp/commit/fbbc1a5)) _(by Chris <chrisbreuer93@gmail.com>)_
- **command**: sort ungrouped commands alphabetically in help output ([cdb562c](https://github.com/stacksjs/clapp/commit/cdb562c)) _(by Chris <chrisbreuer93@gmail.com>)_
- **testing**: capture command output without recursing into the mocked stream ([453c950](https://github.com/stacksjs/clapp/commit/453c950)) _(by Chris <chrisbreuer93@gmail.com>)_
- **cli**: render usage errors with usage line instead of stack ([c83cff4](https://github.com/stacksjs/clapp/commit/c83cff4)) _(by Chris <chrisbreuer93@gmail.com>)_
- **command**: normalize option names in unknown-option check ([4f4c847](https://github.com/stacksjs/clapp/commit/4f4c847)) _(by Chris <chrisbreuer93@gmail.com>)_
- **cli**: apply negated global flags to their modes ([469c454](https://github.com/stacksjs/clapp/commit/469c454)) _(by Chris <chrisbreuer93@gmail.com>)_
- **parser**: parse dashed boolean flags as booleans ([fddc6e8](https://github.com/stacksjs/clapp/commit/fddc6e8)) _(by Chris <chrisbreuer93@gmail.com>)_
- **scripts**: stop double-generating CHANGELOG on release ([7ebf979](https://github.com/stacksjs/clapp/commit/7ebf979)) _(by Glenn Michael Torregosa <gtorregosa@gmail.com>)_

## 🧪 Tests

- cover parser regressions for flags, colon dispatch, and error shape ([138a795](https://github.com/stacksjs/clapp/commit/138a795)) _(by Chris <chrisbreuer93@gmail.com>)_

## 🧹 Chores

- release v0.2.11 ([5a01daf](https://github.com/stacksjs/clapp/commit/5a01daf)) _(by Chris <chrisbreuer93@gmail.com>)_
- upgrade to TypeScript 7 ([e2f26ae](https://github.com/stacksjs/clapp/commit/e2f26ae)) _(by Chris <chrisbreuer93@gmail.com>)_
- **deps**: refresh bun.lock to pick up pickier 0.1.37 ([8a254a6](https://github.com/stacksjs/clapp/commit/8a254a6)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **deps**: refresh bun.lock to pick up pickier 0.1.35 ([f3e2dad](https://github.com/stacksjs/clapp/commit/f3e2dad)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **deps**: refresh bun.lock to pick up pickier 0.1.33 ([3ecc71c](https://github.com/stacksjs/clapp/commit/3ecc71c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **deps**: refresh bun.lock to pick up @stacksjs/logsmith 0.2.3 ([461348d](https://github.com/stacksjs/clapp/commit/461348d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **deps**: refresh bun.lock to pick up buddy-bot 0.9.20 ([82fe034](https://github.com/stacksjs/clapp/commit/82fe034)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **deps**: bump better-dx to ^0.2.15 ([8be4442](https://github.com/stacksjs/clapp/commit/8be4442)) _(by glennmichael123 <gtorregosa@gmail.com>)_

## Contributors

- _Chris <chrisbreuer93@gmail.com>_
- _Glenn Michael Torregosa <gtorregosa@gmail.com>_
- _glennmichael123 <gtorregosa@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.9...v0.2.10)

### 🐛 Bug Fixes

- **clapp**: render namespaced help commands ([0fc01a4](https://github.com/stacksjs/clapp/commit/0fc01a4)) _(by Chris <chrisbreuer93@gmail.com>)_

### 🧹 Chores

- release v0.2.10 ([20d167c](https://github.com/stacksjs/clapp/commit/20d167c)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.9...HEAD)

### 🐛 Bug Fixes

- **clapp**: render namespaced help commands ([0fc01a4](https://github.com/stacksjs/clapp/commit/0fc01a4)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.8...v0.2.9)

### 🐛 Bug Fixes

- **command**: dispatch namespaced commands by fully qualified name ([05ae723](https://github.com/stacksjs/clapp/commit/05ae723)) _(by Chris <chrisbreuer93@gmail.com>)_

### 🧹 Chores

- release v0.2.9 ([dd205d7](https://github.com/stacksjs/clapp/commit/dd205d7)) _(by Chris <chrisbreuer93@gmail.com>)_
- **ci**: bump actions/checkout to v6, actions/cache to v5 ([c59fa59](https://github.com/stacksjs/clapp/commit/c59fa59)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### ⏪ Reverts

- keep staged-lint kebab + bunx gitlint shorthand ([84580b4](https://github.com/stacksjs/clapp/commit/84580b4)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_
- _glennmichael123 <gtorregosa@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.8...HEAD)

### 🐛 Bug Fixes

- **command**: dispatch namespaced commands by fully qualified name ([05ae723](https://github.com/stacksjs/clapp/commit/05ae723)) _(by Chris <chrisbreuer93@gmail.com>)_

### 🧹 Chores

- **ci**: bump actions/checkout to v6, actions/cache to v5 ([c59fa59](https://github.com/stacksjs/clapp/commit/c59fa59)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### ⏪ Reverts

- keep staged-lint kebab + bunx gitlint shorthand ([84580b4](https://github.com/stacksjs/clapp/commit/84580b4)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_
- _glennmichael123 <gtorregosa@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.7...v0.2.8)

### 🐛 Bug Fixes

- **command**: match namespaced commands like `make:seeder` ([ca18908](https://github.com/stacksjs/clapp/commit/ca18908)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **tsconfig**: drop deprecated baseUrl and dead paths block ([bd6a3b7](https://github.com/stacksjs/clapp/commit/bd6a3b7)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### 🧹 Chores

- release v0.2.8 ([97908dd](https://github.com/stacksjs/clapp/commit/97908dd)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- refresh bun.lock to pick up bun-plugin-dtsx@0.9.18 ([897058f](https://github.com/stacksjs/clapp/commit/897058f)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### Contributors

- _glennmichael123 <gtorregosa@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.7...HEAD)

### 🐛 Bug Fixes

- **command**: match namespaced commands like `make:seeder` ([ca18908](https://github.com/stacksjs/clapp/commit/ca18908)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **tsconfig**: drop deprecated baseUrl and dead paths block ([bd6a3b7](https://github.com/stacksjs/clapp/commit/bd6a3b7)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### 🧹 Chores

- refresh bun.lock to pick up bun-plugin-dtsx@0.9.18 ([897058f](https://github.com/stacksjs/clapp/commit/897058f)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### Contributors

- _glennmichael123 <gtorregosa@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.6...v0.2.7)

### 🧹 Chores

- release v0.2.7 ([febc299](https://github.com/stacksjs/clapp/commit/febc299)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **deps**: bump bun-plugin-dtsx to ^0.9.18 ([04515a5](https://github.com/stacksjs/clapp/commit/04515a5)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### Contributors

- _glennmichael123 <gtorregosa@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.6...HEAD)

### 🧹 Chores

- **deps**: bump bun-plugin-dtsx to ^0.9.18 ([04515a5](https://github.com/stacksjs/clapp/commit/04515a5)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### Contributors

- _glennmichael123 <gtorregosa@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.5...v0.2.6)

### 🐛 Bug Fixes

- allow structural unknown-subcommand handlers ([d449dbd](https://github.com/stacksjs/clapp/commit/d449dbd)) _(by Chris <chrisbreuer93@gmail.com>)_
- allow typed command actions ([7fcb57f](https://github.com/stacksjs/clapp/commit/7fcb57f)) _(by Chris <chrisbreuer93@gmail.com>)_
- **test**: make 'note formatter' test deterministic ([29deddc](https://github.com/stacksjs/clapp/commit/29deddc)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### 🧹 Chores

- release v0.2.6 ([0b5f75a](https://github.com/stacksjs/clapp/commit/0b5f75a)) _(by Chris <chrisbreuer93@gmail.com>)_
- release v0.2.5 ([a7e25a2](https://github.com/stacksjs/clapp/commit/a7e25a2)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_
- _glennmichael123 <gtorregosa@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.4...HEAD)

### 🐛 Bug Fixes

- allow structural unknown-subcommand handlers ([d449dbd](https://github.com/stacksjs/clapp/commit/d449dbd)) _(by Chris <chrisbreuer93@gmail.com>)_
- allow typed command actions ([7fcb57f](https://github.com/stacksjs/clapp/commit/7fcb57f)) _(by Chris <chrisbreuer93@gmail.com>)_
- **test**: make 'note formatter' test deterministic ([29deddc](https://github.com/stacksjs/clapp/commit/29deddc)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### 🧹 Chores

- release v0.2.5 ([a7e25a2](https://github.com/stacksjs/clapp/commit/a7e25a2)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_
- _glennmichael123 <gtorregosa@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.4...v0.2.5)

### 🐛 Bug Fixes

- allow typed command actions ([eb4dcdb](https://github.com/stacksjs/clapp/commit/eb4dcdb)) _(by Chris <chrisbreuer93@gmail.com>)_

### 🧹 Chores

- release v0.2.5 ([50cc367](https://github.com/stacksjs/clapp/commit/50cc367)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.4...HEAD)

### 🐛 Bug Fixes

- allow typed command actions ([eb4dcdb](https://github.com/stacksjs/clapp/commit/eb4dcdb)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.3...v0.2.4)

### 🐛 Bug Fixes

- publish valid clapp declarations ([3800823](https://github.com/stacksjs/clapp/commit/3800823)) _(by Chris <chrisbreuer93@gmail.com>)_

### 🧹 Chores

- release v0.2.4 ([c340c6c](https://github.com/stacksjs/clapp/commit/c340c6c)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.3...HEAD)

### 🐛 Bug Fixes

- publish valid clapp declarations ([3800823](https://github.com/stacksjs/clapp/commit/3800823)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.2...v0.2.3)

### 🚀 Features

- onUnknownSubcommand helper for command-group fallback ([79890f2](https://github.com/stacksjs/clapp/commit/79890f2)) _(by Chris <chrisbreuer93@gmail.com>)_

### 🐛 Bug Fixes

- **test**: add description arg to .option() calls ([67dcb54](https://github.com/stacksjs/clapp/commit/67dcb54)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add setup-bun to publish-commit job ([d66d0cc](https://github.com/stacksjs/clapp/commit/d66d0cc)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### 🤖 Continuous Integration

- drop redundant setup-bun (pantry installs bun via deps.yaml) ([a745031](https://github.com/stacksjs/clapp/commit/a745031)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### 🧹 Chores

- release v0.2.3 ([de34df5](https://github.com/stacksjs/clapp/commit/de34df5)) _(by Chris <chrisbreuer93@gmail.com>)_
- release v0.2.2 ([9d0479a](https://github.com/stacksjs/clapp/commit/9d0479a)) _(by Chris <chrisbreuer93@gmail.com>)_
- refresh bun.lock and apply pickier --fix ([497afab](https://github.com/stacksjs/clapp/commit/497afab)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- refresh bun.lock ([e1088db](https://github.com/stacksjs/clapp/commit/e1088db)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- lint:fix ([fcaa28b](https://github.com/stacksjs/clapp/commit/fcaa28b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- refresh bun.lock to pick up latest pickier ([f89d2ba](https://github.com/stacksjs/clapp/commit/f89d2ba)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- fresh install to pick up dtsx 0.9.14 and bunfig 0.15.9 ([ab38fc1](https://github.com/stacksjs/clapp/commit/ab38fc1)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_
- _glennmichael123 <gtorregosa@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.1...HEAD)

### 🚀 Features

- onUnknownSubcommand helper for command-group fallback ([79890f2](https://github.com/stacksjs/clapp/commit/79890f2)) _(by Chris <chrisbreuer93@gmail.com>)_
- add "did you mean?" support ([090a7af](https://github.com/stacksjs/clapp/commit/090a7af)) _(by Chris <chrisbreuer93@gmail.com>)_

### 🐛 Bug Fixes

- **test**: add description arg to .option() calls ([67dcb54](https://github.com/stacksjs/clapp/commit/67dcb54)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add setup-bun to publish-commit job ([d66d0cc](https://github.com/stacksjs/clapp/commit/d66d0cc)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- chain pantry publish:commit calls for single-arg CLI ([4323cb4](https://github.com/stacksjs/clapp/commit/4323cb4)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- commit test snapshots for CI ([5258025](https://github.com/stacksjs/clapp/commit/5258025)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### 🤖 Continuous Integration

- drop redundant setup-bun (pantry installs bun via deps.yaml) ([a745031](https://github.com/stacksjs/clapp/commit/a745031)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### 🧹 Chores

- release v0.2.2 ([9d0479a](https://github.com/stacksjs/clapp/commit/9d0479a)) _(by Chris <chrisbreuer93@gmail.com>)_
- refresh bun.lock and apply pickier --fix ([497afab](https://github.com/stacksjs/clapp/commit/497afab)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- refresh bun.lock ([e1088db](https://github.com/stacksjs/clapp/commit/e1088db)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- lint:fix ([fcaa28b](https://github.com/stacksjs/clapp/commit/fcaa28b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- refresh bun.lock to pick up latest pickier ([f89d2ba](https://github.com/stacksjs/clapp/commit/f89d2ba)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- fresh install to pick up dtsx 0.9.14 and bunfig 0.15.9 ([ab38fc1](https://github.com/stacksjs/clapp/commit/ab38fc1)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- improve exit on error ([eed9bf7](https://github.com/stacksjs/clapp/commit/eed9bf7)) _(by Chris <chrisbreuer93@gmail.com>)_
- fresh install to pick up pickier 0.1.21 ([10af331](https://github.com/stacksjs/clapp/commit/10af331)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- fix lint errors ([057bc6b](https://github.com/stacksjs/clapp/commit/057bc6b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- include md in pickier lint extensions ([2e1d45c](https://github.com/stacksjs/clapp/commit/2e1d45c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update dependencies ([934aea7](https://github.com/stacksjs/clapp/commit/934aea7)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- repo cleanup and modernization ([478397e](https://github.com/stacksjs/clapp/commit/478397e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- remove redundant docs/.vitepress ([5a5608a](https://github.com/stacksjs/clapp/commit/5a5608a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- use Pantry action for publish-commit and add job dependencies ([2d5a0b8](https://github.com/stacksjs/clapp/commit/2d5a0b8)) _(by Chris <chrisbreuer93@gmail.com>)_
- remove file ignores from pickier config ([1c07b18](https://github.com/stacksjs/clapp/commit/1c07b18)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add CLAUDE.md and CHANGELOG.md to pickier ignores ([e85896f](https://github.com/stacksjs/clapp/commit/e85896f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- remove .pickierignore ([9ed23b6](https://github.com/stacksjs/clapp/commit/9ed23b6)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update better-dx to ^0.2.7 ([7ecae79](https://github.com/stacksjs/clapp/commit/7ecae79)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- enrich CLAUDE.md with detailed project context from README ([8f8a13a](https://github.com/stacksjs/clapp/commit/8f8a13a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update CLAUDE.md with project context and crosswind details ([3ed534b](https://github.com/stacksjs/clapp/commit/3ed534b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add proper claude code guidelines ([0ca4fc2](https://github.com/stacksjs/clapp/commit/0ca4fc2)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- use pantry monorepo action instead of pantry-setup ([ae3a9b8](https://github.com/stacksjs/clapp/commit/ae3a9b8)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- ignore claude config in linter ([5381317](https://github.com/stacksjs/clapp/commit/5381317)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add claude code guidelines ([45dec52](https://github.com/stacksjs/clapp/commit/45dec52)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([6a0899f](https://github.com/stacksjs/clapp/commit/6a0899f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([4409200](https://github.com/stacksjs/clapp/commit/4409200)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([e47a5af](https://github.com/stacksjs/clapp/commit/e47a5af)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([9ba3dc6](https://github.com/stacksjs/clapp/commit/9ba3dc6)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([f4d246d](https://github.com/stacksjs/clapp/commit/f4d246d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([989e171](https://github.com/stacksjs/clapp/commit/989e171)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([3ff5919](https://github.com/stacksjs/clapp/commit/3ff5919)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([bd7f531](https://github.com/stacksjs/clapp/commit/bd7f531)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([3c868aa](https://github.com/stacksjs/clapp/commit/3c868aa)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([cb8e43a](https://github.com/stacksjs/clapp/commit/cb8e43a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ce2e4f4](https://github.com/stacksjs/clapp/commit/ce2e4f4)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([2bedeab](https://github.com/stacksjs/clapp/commit/2bedeab)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([1766e0d](https://github.com/stacksjs/clapp/commit/1766e0d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([9269707](https://github.com/stacksjs/clapp/commit/9269707)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([c383913](https://github.com/stacksjs/clapp/commit/c383913)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([d841e4b](https://github.com/stacksjs/clapp/commit/d841e4b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([545dcd4](https://github.com/stacksjs/clapp/commit/545dcd4)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([fba8dc0](https://github.com/stacksjs/clapp/commit/fba8dc0)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **deps**: update all non-major dependencies (#1538) ([e5d6805](https://github.com/stacksjs/clapp/commit/e5d6805)) _(by [renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot]))_ ([#1538](https://github.com/stacksjs/clapp/issues/1538), [#1538](https://github.com/stacksjs/clapp/issues/1538))
- wip ([b61acb5](https://github.com/stacksjs/clapp/commit/b61acb5)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ca9a8cf](https://github.com/stacksjs/clapp/commit/ca9a8cf)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([7eff358](https://github.com/stacksjs/clapp/commit/7eff358)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([40aea95](https://github.com/stacksjs/clapp/commit/40aea95)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([95ba5a1](https://github.com/stacksjs/clapp/commit/95ba5a1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([50b769e](https://github.com/stacksjs/clapp/commit/50b769e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([59bdf33](https://github.com/stacksjs/clapp/commit/59bdf33)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([79ffdf1](https://github.com/stacksjs/clapp/commit/79ffdf1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5355263](https://github.com/stacksjs/clapp/commit/5355263)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **deps**: update all non-major dependencies (#27) ([146e617](https://github.com/stacksjs/clapp/commit/146e617)) _(by [renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot]))_ ([#27](https://github.com/stacksjs/clapp/issues/27), [#27](https://github.com/stacksjs/clapp/issues/27))
- **deps**: update actions/checkout action to v6 (#29) ([c7f4d9d](https://github.com/stacksjs/clapp/commit/c7f4d9d)) _(by [renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot]))_ ([#29](https://github.com/stacksjs/clapp/issues/29), [#29](https://github.com/stacksjs/clapp/issues/29))
- wip ([5f9879f](https://github.com/stacksjs/clapp/commit/5f9879f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c7b9980](https://github.com/stacksjs/clapp/commit/c7b9980)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_
- _[renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot])_
- _glennmichael123 <gtorregosa@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.1...v0.2.2)

### 🚀 Features

- onUnknownSubcommand helper for command-group fallback ([738dba9](https://github.com/stacksjs/clapp/commit/738dba9)) _(by Chris <chrisbreuer93@gmail.com>)_
- add "did you mean?" support ([090a7af](https://github.com/stacksjs/clapp/commit/090a7af)) _(by Chris <chrisbreuer93@gmail.com>)_

### 🐛 Bug Fixes

- chain pantry publish:commit calls for single-arg CLI ([4323cb4](https://github.com/stacksjs/clapp/commit/4323cb4)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- commit test snapshots for CI ([5258025](https://github.com/stacksjs/clapp/commit/5258025)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### 🧹 Chores

- release v0.2.2 ([9f32900](https://github.com/stacksjs/clapp/commit/9f32900)) _(by Chris <chrisbreuer93@gmail.com>)_
- improve exit on error ([eed9bf7](https://github.com/stacksjs/clapp/commit/eed9bf7)) _(by Chris <chrisbreuer93@gmail.com>)_
- fresh install to pick up pickier 0.1.21 ([10af331](https://github.com/stacksjs/clapp/commit/10af331)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- fix lint errors ([057bc6b](https://github.com/stacksjs/clapp/commit/057bc6b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- include md in pickier lint extensions ([2e1d45c](https://github.com/stacksjs/clapp/commit/2e1d45c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update dependencies ([934aea7](https://github.com/stacksjs/clapp/commit/934aea7)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- repo cleanup and modernization ([478397e](https://github.com/stacksjs/clapp/commit/478397e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- remove redundant docs/.vitepress ([5a5608a](https://github.com/stacksjs/clapp/commit/5a5608a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- use Pantry action for publish-commit and add job dependencies ([2d5a0b8](https://github.com/stacksjs/clapp/commit/2d5a0b8)) _(by Chris <chrisbreuer93@gmail.com>)_
- remove file ignores from pickier config ([1c07b18](https://github.com/stacksjs/clapp/commit/1c07b18)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add CLAUDE.md and CHANGELOG.md to pickier ignores ([e85896f](https://github.com/stacksjs/clapp/commit/e85896f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- remove .pickierignore ([9ed23b6](https://github.com/stacksjs/clapp/commit/9ed23b6)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update better-dx to ^0.2.7 ([7ecae79](https://github.com/stacksjs/clapp/commit/7ecae79)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- enrich CLAUDE.md with detailed project context from README ([8f8a13a](https://github.com/stacksjs/clapp/commit/8f8a13a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update CLAUDE.md with project context and crosswind details ([3ed534b](https://github.com/stacksjs/clapp/commit/3ed534b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add proper claude code guidelines ([0ca4fc2](https://github.com/stacksjs/clapp/commit/0ca4fc2)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- use pantry monorepo action instead of pantry-setup ([ae3a9b8](https://github.com/stacksjs/clapp/commit/ae3a9b8)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- ignore claude config in linter ([5381317](https://github.com/stacksjs/clapp/commit/5381317)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add claude code guidelines ([45dec52](https://github.com/stacksjs/clapp/commit/45dec52)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([6a0899f](https://github.com/stacksjs/clapp/commit/6a0899f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([4409200](https://github.com/stacksjs/clapp/commit/4409200)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([e47a5af](https://github.com/stacksjs/clapp/commit/e47a5af)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([9ba3dc6](https://github.com/stacksjs/clapp/commit/9ba3dc6)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([f4d246d](https://github.com/stacksjs/clapp/commit/f4d246d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([989e171](https://github.com/stacksjs/clapp/commit/989e171)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([3ff5919](https://github.com/stacksjs/clapp/commit/3ff5919)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([bd7f531](https://github.com/stacksjs/clapp/commit/bd7f531)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([3c868aa](https://github.com/stacksjs/clapp/commit/3c868aa)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([cb8e43a](https://github.com/stacksjs/clapp/commit/cb8e43a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ce2e4f4](https://github.com/stacksjs/clapp/commit/ce2e4f4)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([2bedeab](https://github.com/stacksjs/clapp/commit/2bedeab)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([1766e0d](https://github.com/stacksjs/clapp/commit/1766e0d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([9269707](https://github.com/stacksjs/clapp/commit/9269707)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([c383913](https://github.com/stacksjs/clapp/commit/c383913)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([d841e4b](https://github.com/stacksjs/clapp/commit/d841e4b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([545dcd4](https://github.com/stacksjs/clapp/commit/545dcd4)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([fba8dc0](https://github.com/stacksjs/clapp/commit/fba8dc0)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **deps**: update all non-major dependencies (#1538) ([e5d6805](https://github.com/stacksjs/clapp/commit/e5d6805)) _(by [renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot]))_ ([#1538](https://github.com/stacksjs/clapp/issues/1538), [#1538](https://github.com/stacksjs/clapp/issues/1538))
- wip ([b61acb5](https://github.com/stacksjs/clapp/commit/b61acb5)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ca9a8cf](https://github.com/stacksjs/clapp/commit/ca9a8cf)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([7eff358](https://github.com/stacksjs/clapp/commit/7eff358)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([40aea95](https://github.com/stacksjs/clapp/commit/40aea95)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([95ba5a1](https://github.com/stacksjs/clapp/commit/95ba5a1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([50b769e](https://github.com/stacksjs/clapp/commit/50b769e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([59bdf33](https://github.com/stacksjs/clapp/commit/59bdf33)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([79ffdf1](https://github.com/stacksjs/clapp/commit/79ffdf1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5355263](https://github.com/stacksjs/clapp/commit/5355263)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **deps**: update all non-major dependencies (#27) ([146e617](https://github.com/stacksjs/clapp/commit/146e617)) _(by [renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot]))_ ([#27](https://github.com/stacksjs/clapp/issues/27), [#27](https://github.com/stacksjs/clapp/issues/27))
- **deps**: update actions/checkout action to v6 (#29) ([c7f4d9d](https://github.com/stacksjs/clapp/commit/c7f4d9d)) _(by [renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot]))_ ([#29](https://github.com/stacksjs/clapp/issues/29), [#29](https://github.com/stacksjs/clapp/issues/29))
- wip ([5f9879f](https://github.com/stacksjs/clapp/commit/5f9879f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c7b9980](https://github.com/stacksjs/clapp/commit/c7b9980)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_
- _[renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot])_
- _glennmichael123 <gtorregosa@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.1...HEAD)

### 🚀 Features

- onUnknownSubcommand helper for command-group fallback ([738dba9](https://github.com/stacksjs/clapp/commit/738dba9)) _(by Chris <chrisbreuer93@gmail.com>)_
- add "did you mean?" support ([090a7af](https://github.com/stacksjs/clapp/commit/090a7af)) _(by Chris <chrisbreuer93@gmail.com>)_

### 🐛 Bug Fixes

- chain pantry publish:commit calls for single-arg CLI ([4323cb4](https://github.com/stacksjs/clapp/commit/4323cb4)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- commit test snapshots for CI ([5258025](https://github.com/stacksjs/clapp/commit/5258025)) _(by glennmichael123 <gtorregosa@gmail.com>)_

### 🧹 Chores

- improve exit on error ([eed9bf7](https://github.com/stacksjs/clapp/commit/eed9bf7)) _(by Chris <chrisbreuer93@gmail.com>)_
- fresh install to pick up pickier 0.1.21 ([10af331](https://github.com/stacksjs/clapp/commit/10af331)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- fix lint errors ([057bc6b](https://github.com/stacksjs/clapp/commit/057bc6b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- include md in pickier lint extensions ([2e1d45c](https://github.com/stacksjs/clapp/commit/2e1d45c)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update dependencies ([934aea7](https://github.com/stacksjs/clapp/commit/934aea7)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- repo cleanup and modernization ([478397e](https://github.com/stacksjs/clapp/commit/478397e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- remove redundant docs/.vitepress ([5a5608a](https://github.com/stacksjs/clapp/commit/5a5608a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- use Pantry action for publish-commit and add job dependencies ([2d5a0b8](https://github.com/stacksjs/clapp/commit/2d5a0b8)) _(by Chris <chrisbreuer93@gmail.com>)_
- remove file ignores from pickier config ([1c07b18](https://github.com/stacksjs/clapp/commit/1c07b18)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add CLAUDE.md and CHANGELOG.md to pickier ignores ([e85896f](https://github.com/stacksjs/clapp/commit/e85896f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- remove .pickierignore ([9ed23b6](https://github.com/stacksjs/clapp/commit/9ed23b6)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update better-dx to ^0.2.7 ([7ecae79](https://github.com/stacksjs/clapp/commit/7ecae79)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- enrich CLAUDE.md with detailed project context from README ([8f8a13a](https://github.com/stacksjs/clapp/commit/8f8a13a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- update CLAUDE.md with project context and crosswind details ([3ed534b](https://github.com/stacksjs/clapp/commit/3ed534b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add proper claude code guidelines ([0ca4fc2](https://github.com/stacksjs/clapp/commit/0ca4fc2)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- use pantry monorepo action instead of pantry-setup ([ae3a9b8](https://github.com/stacksjs/clapp/commit/ae3a9b8)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- ignore claude config in linter ([5381317](https://github.com/stacksjs/clapp/commit/5381317)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- add claude code guidelines ([45dec52](https://github.com/stacksjs/clapp/commit/45dec52)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([6a0899f](https://github.com/stacksjs/clapp/commit/6a0899f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([4409200](https://github.com/stacksjs/clapp/commit/4409200)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([e47a5af](https://github.com/stacksjs/clapp/commit/e47a5af)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([9ba3dc6](https://github.com/stacksjs/clapp/commit/9ba3dc6)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([f4d246d](https://github.com/stacksjs/clapp/commit/f4d246d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([989e171](https://github.com/stacksjs/clapp/commit/989e171)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([3ff5919](https://github.com/stacksjs/clapp/commit/3ff5919)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([bd7f531](https://github.com/stacksjs/clapp/commit/bd7f531)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([3c868aa](https://github.com/stacksjs/clapp/commit/3c868aa)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([cb8e43a](https://github.com/stacksjs/clapp/commit/cb8e43a)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ce2e4f4](https://github.com/stacksjs/clapp/commit/ce2e4f4)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([2bedeab](https://github.com/stacksjs/clapp/commit/2bedeab)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([1766e0d](https://github.com/stacksjs/clapp/commit/1766e0d)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([9269707](https://github.com/stacksjs/clapp/commit/9269707)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([c383913](https://github.com/stacksjs/clapp/commit/c383913)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([d841e4b](https://github.com/stacksjs/clapp/commit/d841e4b)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([545dcd4](https://github.com/stacksjs/clapp/commit/545dcd4)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([fba8dc0](https://github.com/stacksjs/clapp/commit/fba8dc0)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **deps**: update all non-major dependencies (#1538) ([e5d6805](https://github.com/stacksjs/clapp/commit/e5d6805)) _(by [renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot]))_ ([#1538](https://github.com/stacksjs/clapp/issues/1538), [#1538](https://github.com/stacksjs/clapp/issues/1538))
- wip ([b61acb5](https://github.com/stacksjs/clapp/commit/b61acb5)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ca9a8cf](https://github.com/stacksjs/clapp/commit/ca9a8cf)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([7eff358](https://github.com/stacksjs/clapp/commit/7eff358)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([40aea95](https://github.com/stacksjs/clapp/commit/40aea95)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([95ba5a1](https://github.com/stacksjs/clapp/commit/95ba5a1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([50b769e](https://github.com/stacksjs/clapp/commit/50b769e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([59bdf33](https://github.com/stacksjs/clapp/commit/59bdf33)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([79ffdf1](https://github.com/stacksjs/clapp/commit/79ffdf1)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([5355263](https://github.com/stacksjs/clapp/commit/5355263)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **deps**: update all non-major dependencies (#27) ([146e617](https://github.com/stacksjs/clapp/commit/146e617)) _(by [renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot]))_ ([#27](https://github.com/stacksjs/clapp/issues/27), [#27](https://github.com/stacksjs/clapp/issues/27))
- **deps**: update actions/checkout action to v6 (#29) ([c7f4d9d](https://github.com/stacksjs/clapp/commit/c7f4d9d)) _(by [renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot]))_ ([#29](https://github.com/stacksjs/clapp/issues/29), [#29](https://github.com/stacksjs/clapp/issues/29))
- wip ([5f9879f](https://github.com/stacksjs/clapp/commit/5f9879f)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([c7b9980](https://github.com/stacksjs/clapp/commit/c7b9980)) _(by Chris <chrisbreuer93@gmail.com>)_

### Contributors

- _Chris <chrisbreuer93@gmail.com>_
- _[renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot])_
- _glennmichael123 <gtorregosa@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.0...v0.2.1)

### 🧹 Chores

- release v0.2.1 ([88ff16e](https://github.com/stacksjs/clapp/commit/88ff16e)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([0cfb737](https://github.com/stacksjs/clapp/commit/0cfb737)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([30235fb](https://github.com/stacksjs/clapp/commit/30235fb)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ab10c58](https://github.com/stacksjs/clapp/commit/ab10c58)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **deps**: update dependency better-dx to ^0.2.3 (#24) ([148d7a4](https://github.com/stacksjs/clapp/commit/148d7a4)) _(by [renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot]))_ ([#24](https://github.com/stacksjs/clapp/issues/24), [#24](https://github.com/stacksjs/clapp/issues/24))
- wip ([1e4cf5f](https://github.com/stacksjs/clapp/commit/1e4cf5f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([280d65f](https://github.com/stacksjs/clapp/commit/280d65f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([a54bd24](https://github.com/stacksjs/clapp/commit/a54bd24)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **deps**: update all non-major dependencies (#22) ([44877cf](https://github.com/stacksjs/clapp/commit/44877cf)) _(by [renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot]))_ ([#22](https://github.com/stacksjs/clapp/issues/22), [#22](https://github.com/stacksjs/clapp/issues/22))
- wip ([78b199c](https://github.com/stacksjs/clapp/commit/78b199c)) _(by Chris <chrisbreuer93@gmail.com>)_
- improve cover and og-image ([d0560db](https://github.com/stacksjs/clapp/commit/d0560db)) _(by cab-mikee <mike.cabz32@gmail.com>)_
- wip ([1c96d74](https://github.com/stacksjs/clapp/commit/1c96d74)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e104307](https://github.com/stacksjs/clapp/commit/e104307)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([903522e](https://github.com/stacksjs/clapp/commit/903522e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a6ffc40](https://github.com/stacksjs/clapp/commit/a6ffc40)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([dd35633](https://github.com/stacksjs/clapp/commit/dd35633)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3e7acf4](https://github.com/stacksjs/clapp/commit/3e7acf4)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7765923](https://github.com/stacksjs/clapp/commit/7765923)) _(by Chris <chrisbreuer93@gmail.com>)_
- add clarity and cursor rules ([288760c](https://github.com/stacksjs/clapp/commit/288760c)) _(by cab-mikee <mike.cabz32@gmail.com>)_
- **deps**: update dependency actions/checkout to v5.0.0 (#15) ([20de5aa](https://github.com/stacksjs/clapp/commit/20de5aa)) _(by Chris <chrisbreuer93@gmail.com>)_ ([#15](https://github.com/stacksjs/clapp/issues/15), [#15](https://github.com/stacksjs/clapp/issues/15))
- **deps**: update dependency buddy-bot to 0.9.8 (#17) ([ca04858](https://github.com/stacksjs/clapp/commit/ca04858)) _(by Chris <chrisbreuer93@gmail.com>)_ ([#17](https://github.com/stacksjs/clapp/issues/17), [#17](https://github.com/stacksjs/clapp/issues/17))
- **deps**: update dependency bun-git-hooks to 0.3.1 (#18) ([3fc8e30](https://github.com/stacksjs/clapp/commit/3fc8e30)) _(by Chris <chrisbreuer93@gmail.com>)_ ([#18](https://github.com/stacksjs/clapp/issues/18), [#18](https://github.com/stacksjs/clapp/issues/18))
- **deps**: update all non-major dependencies (#11) ([5d1ed57](https://github.com/stacksjs/clapp/commit/5d1ed57)) _(by [renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot]))_ ([#11](https://github.com/stacksjs/clapp/issues/11), [#11](https://github.com/stacksjs/clapp/issues/11))
- **deps**: update all non-major dependencies (#19) ([5d1d143](https://github.com/stacksjs/clapp/commit/5d1d143)) _(by Chris <chrisbreuer93@gmail.com>)_ ([#19](https://github.com/stacksjs/clapp/issues/19), [#19](https://github.com/stacksjs/clapp/issues/19))

### 📄 Miscellaneous

- Merge pull request #13 from stacksjs/renovate/actions-checkout-5.x ([c6de00d](https://github.com/stacksjs/clapp/commit/c6de00d)) _(by [renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot]))_ ([#13](https://github.com/stacksjs/clapp/issues/13), [#13](https://github.com/stacksjs/clapp/issues/13))

### Contributors

- _Chris <chrisbreuer93@gmail.com>_
- _[renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot])_
- _cab-mikee <mike.cabz32@gmail.com>_
- _glennmichael123 <gtorregosa@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.2.0...HEAD)

### 🧹 Chores

- wip ([0cfb737](https://github.com/stacksjs/clapp/commit/0cfb737)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([30235fb](https://github.com/stacksjs/clapp/commit/30235fb)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([ab10c58](https://github.com/stacksjs/clapp/commit/ab10c58)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **deps**: update dependency better-dx to ^0.2.3 (#24) ([148d7a4](https://github.com/stacksjs/clapp/commit/148d7a4)) _(by [renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot]))_ ([#24](https://github.com/stacksjs/clapp/issues/24), [#24](https://github.com/stacksjs/clapp/issues/24))
- wip ([1e4cf5f](https://github.com/stacksjs/clapp/commit/1e4cf5f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([280d65f](https://github.com/stacksjs/clapp/commit/280d65f)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- wip ([a54bd24](https://github.com/stacksjs/clapp/commit/a54bd24)) _(by glennmichael123 <gtorregosa@gmail.com>)_
- **deps**: update all non-major dependencies (#22) ([44877cf](https://github.com/stacksjs/clapp/commit/44877cf)) _(by [renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot]))_ ([#22](https://github.com/stacksjs/clapp/issues/22), [#22](https://github.com/stacksjs/clapp/issues/22))
- wip ([78b199c](https://github.com/stacksjs/clapp/commit/78b199c)) _(by Chris <chrisbreuer93@gmail.com>)_
- improve cover and og-image ([d0560db](https://github.com/stacksjs/clapp/commit/d0560db)) _(by cab-mikee <mike.cabz32@gmail.com>)_
- wip ([1c96d74](https://github.com/stacksjs/clapp/commit/1c96d74)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([e104307](https://github.com/stacksjs/clapp/commit/e104307)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([903522e](https://github.com/stacksjs/clapp/commit/903522e)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([a6ffc40](https://github.com/stacksjs/clapp/commit/a6ffc40)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([dd35633](https://github.com/stacksjs/clapp/commit/dd35633)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([3e7acf4](https://github.com/stacksjs/clapp/commit/3e7acf4)) _(by Chris <chrisbreuer93@gmail.com>)_
- wip ([7765923](https://github.com/stacksjs/clapp/commit/7765923)) _(by Chris <chrisbreuer93@gmail.com>)_
- add clarity and cursor rules ([288760c](https://github.com/stacksjs/clapp/commit/288760c)) _(by cab-mikee <mike.cabz32@gmail.com>)_
- **deps**: update dependency actions/checkout to v5.0.0 (#15) ([20de5aa](https://github.com/stacksjs/clapp/commit/20de5aa)) _(by Chris <chrisbreuer93@gmail.com>)_ ([#15](https://github.com/stacksjs/clapp/issues/15), [#15](https://github.com/stacksjs/clapp/issues/15))
- **deps**: update dependency buddy-bot to 0.9.8 (#17) ([ca04858](https://github.com/stacksjs/clapp/commit/ca04858)) _(by Chris <chrisbreuer93@gmail.com>)_ ([#17](https://github.com/stacksjs/clapp/issues/17), [#17](https://github.com/stacksjs/clapp/issues/17))
- **deps**: update dependency bun-git-hooks to 0.3.1 (#18) ([3fc8e30](https://github.com/stacksjs/clapp/commit/3fc8e30)) _(by Chris <chrisbreuer93@gmail.com>)_ ([#18](https://github.com/stacksjs/clapp/issues/18), [#18](https://github.com/stacksjs/clapp/issues/18))
- **deps**: update all non-major dependencies (#11) ([5d1ed57](https://github.com/stacksjs/clapp/commit/5d1ed57)) _(by [renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot]))_ ([#11](https://github.com/stacksjs/clapp/issues/11), [#11](https://github.com/stacksjs/clapp/issues/11))
- **deps**: update all non-major dependencies (#19) ([5d1d143](https://github.com/stacksjs/clapp/commit/5d1d143)) _(by Chris <chrisbreuer93@gmail.com>)_ ([#19](https://github.com/stacksjs/clapp/issues/19), [#19](https://github.com/stacksjs/clapp/issues/19))

### 📄 Miscellaneous

- Merge pull request #13 from stacksjs/renovate/actions-checkout-5.x ([c6de00d](https://github.com/stacksjs/clapp/commit/c6de00d)) _(by [renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot]))_ ([#13](https://github.com/stacksjs/clapp/issues/13), [#13](https://github.com/stacksjs/clapp/issues/13))

### Contributors

- _Chris <chrisbreuer93@gmail.com>_
- _[renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>](https://github.com/renovate[bot])_
- _cab-mikee <mike.cabz32@gmail.com>_
- _glennmichael123 <gtorregosa@gmail.com>_

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.1.18...HEAD)

### Contributors

- Chris <chrisbreuer93@gmail.com>

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.1.17...HEAD)

### Contributors

- Chris <chrisbreuer93@gmail.com>

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.1.17...HEAD)

### Contributors

- Chris <chrisbreuer93@gmail.com>

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.1.16...HEAD)

### Contributors

- Adelino Ngomacha <adelinob335@gmail.com>
- Chris <chrisbreuer93@gmail.com>

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.1.16...HEAD)

### Contributors

- Adelino Ngomacha <adelinob335@gmail.com>
- Chris <chrisbreuer93@gmail.com>

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.1.15...HEAD)

### Contributors

- Adelino Ngomacha <Adelinob335@gmail.com>

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.1.14...HEAD)

### Contributors

- Adelino Ngomacha <Adelinob335@gmail.com>
- zJohn <Adelinob335@gmail.com>

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.1.13...HEAD)

### Contributors

- Adelino Ngomacha <Adelinob335@gmail.com>
- renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>
- zJohn <Adelinob335@gmail.com>

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.1.12...HEAD)

### Contributors

- Adelino Ngomacha <Adelinob335@gmail.com>

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.1.12...HEAD)

### Contributors

- Adelino Ngomacha <Adelinob335@gmail.com>

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.1.10...HEAD)

### Contributors

- Adelino Ngomacha <Adelinob335@gmail.com>

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.1.10...HEAD)

### Contributors

- Adelino Ngomacha <Adelinob335@gmail.com>

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.1.10...HEAD)

### Contributors

- Adelino Ngomacha <Adelinob335@gmail.com>

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.1.10...HEAD)

### Contributors

- Adelino Ngomacha <Adelinob335@gmail.com>

[Compare changes](https://github.com/stacksjs/clapp/compare/v0.1.10...HEAD)

### Contributors

- Adelino Ngomacha <Adelinob335@gmail.com>

## v0.1.4...main

[compare changes](https://github.com/stacksjs/clapp/compare/v0.1.4...main)

### 🏡 Chore

- Update `action-releaser` ([17f3191](https://github.com/stacksjs/clapp/commit/17f3191))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.1.3...main

[compare changes](https://github.com/stacksjs/clapp/compare/v0.1.3...main)

### 🏡 Chore

- Use `stacksjs/action-releaser` action ([d57d9e3](https://github.com/stacksjs/clapp/commit/d57d9e3))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.1.2...v0.1.2

[compare changes](https://github.com/stacksjs/clapp/compare/v0.1.2...v0.1.2)

## v0.1.1...main

[compare changes](https://github.com/stacksjs/clapp/compare/v0.1.1...main)

### 🏡 Chore

- Type improvements ([346348a](https://github.com/stacksjs/clapp/commit/346348a))
- Add credits ([2198294](https://github.com/stacksjs/clapp/commit/2198294))
- Fix dummy import ([418fbbc](https://github.com/stacksjs/clapp/commit/418fbbc))
- Minor adjustments ([d9f2a33](https://github.com/stacksjs/clapp/commit/d9f2a33))
- Remove unused import ([d26a983](https://github.com/stacksjs/clapp/commit/d26a983))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.1.0...main

[compare changes](https://github.com/stacksjs/clapp/compare/v0.1.0...main)

### 🏡 Chore

- Zip the binaries ([969a5f6](https://github.com/stacksjs/clapp/commit/969a5f6))
- Lint ([139f6a8](https://github.com/stacksjs/clapp/commit/139f6a8))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.0.2...main

[compare changes](https://github.com/stacksjs/clapp/compare/v0.0.2...main)

### 🏡 Chore

- Wip ([8f8a08c](https://github.com/stacksjs/clapp/commit/8f8a08c))
- Wip ([de89b0c](https://github.com/stacksjs/clapp/commit/de89b0c))
- Wip ([5eba81e](https://github.com/stacksjs/clapp/commit/5eba81e))
- Wip ([edbf697](https://github.com/stacksjs/clapp/commit/edbf697))
- Wip ([c607f04](https://github.com/stacksjs/clapp/commit/c607f04))
- Wip ([b984f0e](https://github.com/stacksjs/clapp/commit/b984f0e))
- Wip ([c453923](https://github.com/stacksjs/clapp/commit/c453923))
- Wip ([0134c70](https://github.com/stacksjs/clapp/commit/0134c70))
- Wip ([1398326](https://github.com/stacksjs/clapp/commit/1398326))
- Wip ([c8918d0](https://github.com/stacksjs/clapp/commit/c8918d0))
- Wip ([d89d964](https://github.com/stacksjs/clapp/commit/d89d964))
- Wip ([e5cd78f](https://github.com/stacksjs/clapp/commit/e5cd78f))
- Wip ([7975824](https://github.com/stacksjs/clapp/commit/7975824))
- Wip ([2e9834d](https://github.com/stacksjs/clapp/commit/2e9834d))
- Wip ([67e5f22](https://github.com/stacksjs/clapp/commit/67e5f22))
- Wip ([af3c790](https://github.com/stacksjs/clapp/commit/af3c790))
- Wip ([9eb5b0c](https://github.com/stacksjs/clapp/commit/9eb5b0c))
- Wip ([ce0cdce](https://github.com/stacksjs/clapp/commit/ce0cdce))
- Wip ([0aded97](https://github.com/stacksjs/clapp/commit/0aded97))
- Wip ([9a5417d](https://github.com/stacksjs/clapp/commit/9a5417d))
- Wip ([0466131](https://github.com/stacksjs/clapp/commit/0466131))
- Wip ([bada575](https://github.com/stacksjs/clapp/commit/bada575))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## v0.0.1...main

[compare changes](https://github.com/stacksjs/clapp/compare/v0.0.1...main)

### 🏡 Chore

- Wip ([627fcc6](https://github.com/stacksjs/clapp/commit/627fcc6))
- Wip ([8d95b8f](https://github.com/stacksjs/clapp/commit/8d95b8f))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))

## ...main

### 🏡 Chore

- Initial commit ([10424e8](https://github.com/stacksjs/clapp/commit/10424e8))
- Wip ([8c38983](https://github.com/stacksjs/clapp/commit/8c38983))
- Wip ([5eef40e](https://github.com/stacksjs/clapp/commit/5eef40e))
- Wip ([bc2be28](https://github.com/stacksjs/clapp/commit/bc2be28))
- Wip ([780fa02](https://github.com/stacksjs/clapp/commit/780fa02))
- Wip ([6346d8f](https://github.com/stacksjs/clapp/commit/6346d8f))
- Wip ([fe9b3b6](https://github.com/stacksjs/clapp/commit/fe9b3b6))
- Wip ([07c9a6f](https://github.com/stacksjs/clapp/commit/07c9a6f))
- Wip ([9a9ab75](https://github.com/stacksjs/clapp/commit/9a9ab75))
- Wip ([88b398d](https://github.com/stacksjs/clapp/commit/88b398d))
- Wip ([b9467b2](https://github.com/stacksjs/clapp/commit/b9467b2))
- Wip ([c6a511a](https://github.com/stacksjs/clapp/commit/c6a511a))
- Wip ([83b289e](https://github.com/stacksjs/clapp/commit/83b289e))
- Wip ([ad80058](https://github.com/stacksjs/clapp/commit/ad80058))
- Wip ([db503da](https://github.com/stacksjs/clapp/commit/db503da))
- Wip ([8c5028a](https://github.com/stacksjs/clapp/commit/8c5028a))
- Wip ([acf03f1](https://github.com/stacksjs/clapp/commit/acf03f1))
- Wip ([3abe91b](https://github.com/stacksjs/clapp/commit/3abe91b))
- Wip ([ff5c5b3](https://github.com/stacksjs/clapp/commit/ff5c5b3))
- Wip ([da4d507](https://github.com/stacksjs/clapp/commit/da4d507))
- Wip ([8117e4a](https://github.com/stacksjs/clapp/commit/8117e4a))
- Wip ([4b4edfb](https://github.com/stacksjs/clapp/commit/4b4edfb))

### ❤️ Contributors

- Chris ([@chrisbbreuer](https://github.com/chrisbbreuer))
