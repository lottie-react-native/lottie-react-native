# lottie-react-native (v8)

`lottie-react-native` v8 — the view reimplemented on
[Nitro Modules](https://nitro.margelo.com).

**This is the package that ships.** It is published as `lottie-react-native`,
and `release-it` publishes this workspace and no other. `packages/core` keeps
the v7 implementation as the private `lottie-react-native-v7`, for 7.x
maintenance from a release branch only.

The directory is still called `packages/nitro` — that name predates the switch
and does not track what ships.

## Why

v7 renders through a legacy Fabric component whose spec carries real codegen
scars — including a `dummy` prop that exists purely to work around React Native
codegen choking on `ReadonlyArray<Object>`. Nitro replaces RN codegen with
`nitrogen` and gives a typed C++/Swift/Kotlin bridge, so those workarounds go
away.

## The public API is identical to v7

Deliberately, down to the quirks: default export only (no named `LottieView`),
`containerStyle` accepted by the component but absent from the exported
`LottieViewProps`, and the filter types unexported. v7's and v8's
`LottieViewProps` and `AnimationObject` are mutually assignable in both
directions, which is checked with `tsc` rather than by eye.

The file layout mirrors `packages/core/src` file-for-file, so the two
implementations can be diffed against each other and the eventual fold-in is
mechanical.

| v7 (`packages/core/src/`) | here (`src/`) |
|---|---|
| `specs/LottieAnimationViewNativeComponent.ts` | `LottieView.nitro.ts` + `views/LottieView.ts` |
| `LottieView/index.tsx` | `LottieView/index.tsx` (class wrapper) |
| `LottieView/index.web.tsx` | `LottieView/index.web.tsx` |
| `LottieView/utils.ts` | `LottieView/utils.ts` |
| `types.ts` | `types.ts` |
| `index.tsx` | `index.tsx` |

## What works

All props, all three events, and the four imperative commands, on iOS and
Android. Web works through `@lottiefiles/dotlottie-react`, as in v7.

## What does not

- **iOS + Android only.** Nitro Views are Fabric-only, so macOS, visionOS,
  Windows and tvOS are not supported. v7 supported all four.
- **`PlatformColor` in `colorFilters`.** Colour is resolved by RN's
  `processColor` and crosses as a number, so every colour *string* v7 took still
  works, but `PlatformColor`/`OpaqueColorValue` are not accepted — Nitro cannot
  express the object half of `ProcessedColorValue`.

## Working on it

```bash
yarn setup            # bob build into lib/
yarn codegen          # REQUIRED after editing src/LottieView.nitro.ts
yarn tsc:lib          # typecheck this package
yarn tsc              # typecheck example-v8
yarn lint:swift
yarn android          # run example-v8
yarn ios
yarn run:bundler      # Metro, needed by the two above
```

`nitrogen/generated/` is **committed**, because the podspec, `build.gradle`,
`CMakeLists.txt` and the view wrapper all reference generated artifacts — a
fresh clone cannot even `pod install` without them. So after any change to
`LottieView.nitro.ts` you must re-run `yarn codegen` and commit the result. CI
enforces this by regenerating and failing on a diff.

`yarn codegen` also re-vendors the generated view config to
`src/views/LottieViewConfig.json`, which is committed and covered by the same
drift check. It exists because the import has to resolve from both `src` and the
built `lib`; see `ARCHITECTURE.md` section 15c. Never edit it by hand.

After codegen adds or removes files you also need `yarn pods` and a Gradle sync,
which nitrogen itself reminds you about.

## `ARCHITECTURE.md`

Read it before changing behaviour. It is the single source of truth for the port:
how prop application, source loading, playback, colour handling and the imperative
commands work, followed by the divergence log — every place v8 deliberately differs
from v7, and why, numbered so it can be cited: v7 bugs replicated on purpose (so
upgrading is not a silent behavioural change), v8-only divergences, v7 native bugs
that are fixed, command divergences, and drops found by audit.

The source files in this package carry no comments — that rationale is all in the
architecture document, anchored to the file and symbol it governs. See `AGENTS.md`
at the repo root for the policy and its carve-outs.

`MIGRATION-7-TO-8.md` at the repo root is the user-facing subset.
