# AGENTS.md

Index and working rules for this repository. `CLAUDE.md` is a symlink to this file —
edit this one.

## Documentation index

| Area | Document |
|---|---|
| v8 (Nitro) implementation and example | [`packages/nitro/ARCHITECTURE.md`](packages/nitro/ARCHITECTURE.md) |

Every area that adopts the comment policy below gets one architecture document, listed
here. If you add one, add its row.

## Layout

| Path | What it is |
|---|---|
| `packages/core` | **v7** — the shipping library, React Native codegen |
| `example` | **v7** example app |
| `packages/nitro` | **v8** — the Nitro Modules port |
| `example-v8` | **v8** example app |
| `packages/nitro/nitrogen/generated` | committed codegen output — never edit by hand |

v7 and v8 ship side by side. Several v8 files are deliberate byte-comparable copies of a
v7 counterpart, so a change to one is often a question about the other.

## Commands

```bash
yarn nitro:codegen        # regenerate nitrogen output (must leave the tree clean)
yarn nitro:tsc:lib        # typecheck packages/nitro
yarn nitro:tsc            # typecheck example-v8
yarn nitro:lint:swift     # SwiftLint over packages/nitro/ios
yarn nitro:build:android  # assemble the v8 example
yarn nitro:build:ios      # build the v8 example
yarn nitro:pods           # pod install for example-v8
```

After changing `packages/nitro/src/LottieView.nitro.ts`, run `yarn nitro:codegen` and
commit the result — CI fails on any drift between the spec and `nitrogen/generated`.

## Rules

### Comment policy

**Applies to `packages/nitro/**` and `example-v8/**` only.**

Source files in those paths carry **no comments**. Rationale, design decisions, ordering
constraints, replicated v7 bugs and anything else that would have been a comment belong
in that area's architecture document, anchored to the file and symbol it governs.

Covers `.ts`, `.tsx`, `.swift`, `.kt`, `.cpp` — including `// MARK:` section markers.

**Carve-outs.** These are not comments in the sense the rule means, and stay:

1. **Public API JSDoc** — documentation on exported types that consumers see in their
   editor.
2. **Functional directives** — anything the toolchain reads rather than a human:
   `eslint-disable`, `@ts-expect-error`, `@ts-ignore`, `prettier-ignore`, `swiftlint:`,
   `@format`, and similar.
3. **Generated code** — `packages/nitro/nitrogen/generated/**` is nitrogen's output and
   is rewritten wholesale by `yarn nitro:codegen`.
4. **Build and config files** — podspec, `*.gradle`, `gradle.properties`, `CMakeLists.txt`,
   `Podfile`, `Gemfile`, metro/webpack/babel config, `.gitignore`, `index.html`. Much of
   this is upstream boilerplate it would be wrong to diverge from, and the rest is
   read by people who are not reading the architecture doc.
5. **Exempt files**, listed verbatim:
   - `packages/nitro/src/types.ts`
   - `packages/nitro/src/LottieView/utils.ts`
   - `example-v8/App.tsx`

   Each is byte-comparable with a v7 counterpart, and stripping it would inflate the diff
   against code that must not be touched. Exemption preserves **v7-inherited** comments
   only — a comment v8 authors in one of these files still moves to the architecture doc.
   If you add a file to this list, say which v7 file it mirrors and why.

### v7 is off-limits

Do not apply the comment policy to `packages/core` or `example`. v7 keeps its existing
conventions, including its comments. Changes there are a separate decision, not a
side effect of working on v8.

### Stacked pull requests

This repo uses `gh stack`. Run `gh stack view --json` before assuming a branch's base,
and `gh stack sync --prune` after PRs merge. Never `gh pr merge` a stacked PR.
