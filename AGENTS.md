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
| `packages/nitro` | **v8** — the published `lottie-react-native`, Nitro Modules |
| `example-v8` | **v8** example app |
| `packages/core` | **v7** — `lottie-react-native-v7`, private 7.x maintenance |
| `example` | **v7** example app |
| `packages/nitro/nitrogen/generated` | committed codegen output — never edit by hand |

**The directory names no longer match what ships.** `packages/nitro` is the package
consumers install as `lottie-react-native`; `packages/core` is the private v7 maintenance
package and is not published from `master`. Several v8 files are deliberate
byte-comparable copies of a v7 counterpart, so a change to one is often a question about
the other.

## Commands

Unprefixed commands act on v8 (the published package). `v7:`-prefixed commands act on the
maintenance package.

```bash
yarn setup            # bob build of packages/nitro into lib/
yarn codegen          # regenerate nitrogen output (must leave the tree clean)
yarn tsc:lib          # typecheck packages/nitro
yarn tsc              # typecheck example-v8
yarn lint:swift       # SwiftLint over packages/nitro/ios
yarn build:android    # assemble the v8 example
yarn build:ios        # build the v8 example
yarn pods             # pod install for example-v8

yarn v7:setup         # bob build of packages/core
yarn v7:tsc           # typecheck example
yarn v7:lint:swift    # SwiftLint over packages/core/ios
yarn v7:lint:spm-parity
```

After changing `packages/nitro/src/LottieView.nitro.ts`, run `yarn codegen` and commit the
result — CI fails on any drift between the spec and `nitrogen/generated`.

`yarn codegen` also re-vendors nitrogen's view config to
`packages/nitro/src/views/LottieViewConfig.json`. That copy is committed and drift-checked
alongside `nitrogen/generated`: the import has to resolve from both `src` and the built
`lib`, and a single relative path out of `src` cannot do that. Never edit it by hand.

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
   is rewritten wholesale by `yarn codegen`.
4. **Upstream template text in build and config files.** Podspec, `*.gradle`,
   `gradle.properties`, `CMakeLists.txt`, `Podfile`, `Gemfile`, metro/webpack/babel config,
   `.gitignore` and `index.html` keep whatever comments ship in the
   `react-native-test-app`, React Native, Gradle or CocoaPods template — diverging from
   boilerplate is noise. Structural section labels in a `.gitignore` (`# Android`, `# iOS`)
   count as template.

   **Anything we wrote in those files does not.** Explanations of why a hook, pin, flag or
   plugin exclusion is there belong in the architecture doc like any other rationale —
   `ARCHITECTURE.md` section 15c covers all of them. This applies even when v7's copy of the
   same file has the comment: v7 is not touched, so the two will differ, and that is fine.
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
