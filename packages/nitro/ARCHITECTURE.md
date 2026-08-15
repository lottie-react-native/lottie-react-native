# lottie-react-native v8 (Nitro) — architecture

The single source of truth for how the v8 port works and why. The source files in
this package carry no comments; everything that would have been a comment is here,
anchored to the file and symbol it governs. See the root `AGENTS.md` for the policy.

**Contents**

1. [Overview](#1-overview)
2. [The Nitro spec and codegen constraints](#2-the-nitro-spec-and-codegen-constraints)
3. [The JS wrapper](#3-the-js-wrapper)
4. [Prop application](#4-prop-application)
5. [Applied state and diffing](#5-applied-state-and-diffing)
6. [Lifecycle](#6-lifecycle)
7. [Source loading](#7-source-loading)
8. [Composition-dependent props](#8-composition-dependent-props)
9. [Playback and events](#9-playback-and-events)
10. [Colour handling](#10-colour-handling)
11. [Text filters](#11-text-filters)
12. [Android registration and JNI](#12-android-registration-and-jni)
13. [v7 bugs replicated on purpose](#13-v7-bugs-replicated-on-purpose) (items 1–6)
14. [v8-only divergences](#14-v8-only-divergences) (items 7–11)
15. [Native divergences from v7](#15-native-divergences-from-v7) (items 12–30)
16. [Testing status](#16-testing-status)
17. [The example app](#17-the-example-app)
18. [Comment carve-outs](#18-comment-carve-outs)

---

## 1. Overview

v8 reimplements the view on [Nitro Modules](https://nitro.margelo.com/) instead of
React Native's own codegen. Nitro Views are Fabric-only and exist for iOS and
Android only, which is why v8 drops macOS, visionOS, Windows and tvOS (see item 4
and the platform note in item 37).

```
packages/nitro/
  src/LottieView.nitro.ts     the Nitro spec — native prop/method surface
  src/types.ts                the public API type (identical to v7's)
  src/LottieView/index.tsx    the wrapper presenting v7's public API
  src/LottieView/utils.ts     source parsing, v7 verbatim
  src/views/LottieView.ts     the raw generated host component
  ios/HybridLottieView.swift  iOS implementation
  android/…/HybridLottieView.kt        Android implementation
  android/…/LottieNitroPackage.kt      RN view registration
  android/src/main/cpp/cpp-adapter.cpp JNI_OnLoad
  nitrogen/generated/         committed codegen output — never edit by hand
```

`nitrogen/generated` is committed by necessity: the podspec, `build.gradle`,
`CMakeLists.txt` and `src/views/LottieView.ts` all reference generated artifacts, so
a fresh clone cannot even `pod install` without them. Regenerate with
`yarn nitro:codegen`; CI fails on any diff.

The single most important structural difference from v7: **v7 applied each prop the
moment it arrived; v8 stores props and applies everything once per batch.** Nearly
every native divergence below follows from that.

---

## 2. The Nitro spec and codegen constraints

**`src/LottieView.nitro.ts`** — the native prop surface, translated from v7's
`packages/core/src/specs/LottieAnimationViewNativeComponent.ts`. This is *not* the
public API; `LottieViewProps` in `src/types.ts` is. The wrapper translates between
them, exactly as v7's wrapper translates to its codegen spec.

**`ResizeMode` / `RenderMode`** must be named `type` aliases. Nitrogen rejects inline
string-literal unions ("Inline union types are not supported by Nitrogen!"). As named
aliases they generate a C++ `enum class` whose JSI converter maps the JS string both
ways, so the wire format stays `'contain'` exactly as in v7.

**`LottieColorFilter`** is named that rather than `ColorFilter` because the generated
Kotlin data class lands in the same package as `HybridLottieView.kt`, where a plain
`ColorFilter` would shadow `android.graphics.ColorFilter`. The public type in
`types.ts` keeps v7's `ColorFilter` name.

**`NativeLottieViewProps`** — deliberately absent members, and why:

- `style`, `testID`, `onLayout`, `pointerEvents` and every other `ViewProps`: the
  generated props class extends `react::ViewProps` and React Native merges
  `PlatformBaseViewConfig.validAttributes`. Declaring them here would double-parse them.
- `hybridRef`: injected by the generator, never declared.
- `dummy`: v7 needed it only to work around an RN codegen bug with
  `ReadonlyArray<Object>`. Nitrogen has no such bug.
- `useNativeLooping` (Windows), `webStyle` / `hover` / `direction` (web): no native
  counterpart on a Nitro view. They stay in the public `LottieViewProps` and are
  dropped by the view config.

**No property may be `readonly`.** `Property.cppSetter` returns undefined for readonly
props, but both view generators still emit `setX(...)` calls, which then don't exist
natively.

**Array props must be mutable.** `ReadonlyArray<T>` is not recognised by ts-morph's
`Type.isArray()`, so nitrogen falls through and tries to build a struct literally named
`ReadonlyArray`.

**`progress`** — v7 typed this `Float`; Nitro has a single `double` number type. Same
for the frame arguments on `play`, which v7 typed `Int32`.

**Callbacks** — v7 delivered `onAnimationFinish` / `onAnimationFailure` /
`onAnimationLoaded` as Fabric bubbling events carrying `{ isCancelled }` / `{ error }` /
`{}` payloads. Nitro callbacks are direct JSI functions, so the payload objects collapse
to plain parameters, and `onAnimationLoaded` has none at all (nitrogen rejects empty
structs). They return `void` so they stay fire-and-forget; a non-void return would become
a `Promise` natively. Every call site must wrap them with `callback(...)` — the wrapper
does that, so end users keep passing plain functions.

**The `LottieView` type alias name is load-bearing.** Nitrogen reads
`type.getAliasSymbolOrThrow()` and derives every generated name from it —
`HybridLottieViewSpec`, `HybridLottieViewManager`, the Fabric component name and
`uiViewClassName` — and `nitro.json`'s `autolinking` key must match. It must be a `type`
alias referencing `HybridView<…>` directly, not indirected through another alias. The
`Native…`-prefixed Props/Methods interface names are never read by nitrogen (only their
members), which is why they can be prefixed without colliding with the public
`LottieViewProps`.

**`src/views/LottieView.ts`** exports the raw Nitro host component. It is internal;
consumers get the wrapper in `src/LottieView`, which presents v7's public API.

---

## 3. The JS wrapper

**`src/LottieView/index.tsx` — `LottieView`** is a class component deliberately. It
preserves two documented v7 patterns a function component would break:
`Animated.createAnimatedComponent(LottieView)` driving `progress`, and the ref being the
component instance, so `useRef<LottieView>()` works and `play` can be destructured off it.

**`captureRef`, `onAnimationFinish`, `onAnimationFailure`, `onAnimationLoaded`** are each
wrapped with `callback(...)` exactly once, in a field, so the `{ f }` object identity is
stable for the component's lifetime. Nitro diffs props with `!==` and re-invokes the
native setter whenever identity changes, so wrapping inside `render()` would re-fire every
setter — and re-invoke `hybridRef` — on every render. Native calls `hybridRef` after the
props of the same transaction have been applied, which is why `autoPlay` can call `play()`
straight from there, exactly as v7's `captureRef` did.

**Every optional prop is always passed, never conditionally.** When a prop goes from set
to unset React Native sends native a JS `null`, but Nitro's `std::optional` converter
accepts only `undefined` — `null` falls through to `asString()` and throws inside the C++
props parse. `parsePossibleSources` returns exactly one source key, so spreading it would
crash the moment the source kind changed (a local name swapped for a remote URI). Empty
string means "absent" to native. See item 8.

**`play(startFrame?, endFrame?)`** uses `?? -1` rather than `|| -1`, so an explicit frame
`0` survives. `-1` is the sentinel native reads as "no explicit frame".

**`defaultProps.source = undefined`** — see item 3.

**`speed` from `duration`** — see item 1.

**`src/LottieView/utils.ts` — `parsePossibleSources`** annotates `source` as `any` rather
than leaving it implicit. This package type-checks with `strict: true` (packages/core does
not), and `noImplicitAny` would reject the original signature. The body is v7 verbatim,
including the `.lottie` substring test — see item 2.

---

## 4. Prop application

**`ios/HybridLottieView.swift`** is ported from v7's
`packages/core/ios/LottieReactNative/ContainerView.swift`, restructured around Nitro's
batching. v7 applied each prop immediately as it arrived, which built the animation view
two or three times per commit and silently dropped the text provider whenever `renderMode`
changed after `textFiltersIOS`. Here the setters are pure stores and everything is applied
once, in a correct order, from `afterUpdate()`.

**`android/…/HybridLottieView.kt`** is ported from v7's `LottieAnimationViewManagerImpl.kt`
and `LottieAnimationViewPropertyManager.kt`. v7's property manager committed eagerly from
inside the source setters, so `commitChanges()` ran two or more times per transaction, and
its `.lottie` branch used a bare `return` inside a `let` — a non-local return that skipped
every remaining prop. Those props only landed because a second commit followed, and an
unresolvable raw name wedged the view permanently. Here too the setters are pure stores and
everything is applied once from `afterUpdate()`.

**Threading.** Nitro calls the setters and `afterUpdate()` synchronously on the main/UI
thread — iOS via `RCTViewComponentView.updateProps` under `RCTAssertMainQueue`, Android via
`SurfaceMountingManager` `@UiThread` — so no dispatching or posting is needed for any Lottie
call. Imperative *methods* are different; see item 10.

**Ordering inside `afterUpdate()` is load-bearing:**

| Step | iOS | Android |
|---|---|---|
| 1 | snapshot `cacheComposition` — the loaders below consume it | `cacheComposition` first — the single-arg `setAnimation*` overloads read the field; v7 applied it from the prop setter so ordering vs the source was luck |
| 2 | `imageProvider` and `textProvider` — read when the layer is built, so both must precede the source | `imageAssetsFolder` — `clearComposition()` nulls the `ImageAssetManager`, which is rebuilt lazily from this string; v7 applied it after, too late |
| 3 | `renderMode` before the source, so one commit builds one layer; v7 applied it after, rebuilding on first mount | — |
| 4 | source | source (`clearComposition()` drops the composition layer, so previously applied value callbacks go with it) |
| 5 | if the source did *not* change, call `applyCompositionDependent()` directly — nothing re-entered the post-load path | same |

---

## 5. Applied state and diffing

Both platforms keep `applied*` fields holding value-typed snapshots of what has actually
been pushed to Lottie.

**Native value diffing is mandatory, not an optimisation.** Nitro compares props with
`jsi::Value::strictEquals`, which is reference identity for arrays, so an inline
`colorFilters={[...]}` arrives "changed" on every single commit. Without diffing, every
commit would re-push every filter. See item 15.

**`ColorFilterSnapshot`** (both platforms) holds the colour as a raw bit pattern rather
than the `Double` that crossed, so the `NaN` sentinel compares equal to itself. Under IEEE
equality `NaN != NaN`, which would make an unresolvable colour read as "changed" on every
commit and re-emit its failure forever. On iOS that is required outright. On Android,
Kotlin does define total-order equality for `Double` properties of a data class, which
would have worked — but that is a subtle rule to rest a repeating callback on, and it would
not match iOS, so both sides use the bit pattern.

**`loadGeneration`** is bumped on every source change, before the load starts. An async
completion carrying a stale generation is dropped, making the behaviour last-*requested*
wins where v7 was last-*completed*. See item 20.

**`suppressFinishDepth`** (iOS) gates spurious `onAnimationFinish`. Three separate Lottie
paths invoke a stored completion with `finished: false` — the `currentProgress` setter, the
`animation`/`configuration` `didSet`, and every `play()` overload — all via
`removeCurrentAnimationIfNecessary()`. Lottie's own `ignoreDelegate` suppression covers only
one of them, so we supply the rest.

---

## 6. Lifecycle

**iOS — one `LottieAnimationView` for the component's lifetime.** It never needs replacing:
`configuration` and `animation` are settable vars whose `didSet` rebuilds the layer in
place, and `makeAnimationLayer` re-applies registered value providers and carries the image
and text providers across. React Native frames it via `RCTViewComponentView`. See item 14.

**iOS — `init()` must stay zero-argument**, because the generated
`LottieNitroAutolinking.swift` calls `HybridLottieView()`. It is `override` because
`HybridLottieViewSpec` is a composition including the `open class HybridLottieViewSpec_base`,
which declares `public init()`.

**iOS — the `animationLoaded` hook** is installed once in `init()`. It fires on every
`animation` `didSet`, which is the one hook both the sync and async source paths pass
through, and that is what lets `applyCompositionDependent()` be reached from either. Its own
`didSet` fires immediately when an animation is already present; at init there is none, so
installing it there is safe.

**Android — one `LottieAnimationView` for the component's lifetime**, which is what buys
lottie-android's own `cancelLoaderTask()`: it detaches the listeners of a superseded
composition load, so a stale load cannot reach us. `CENTER_INSIDE` at construction matches
v7's `createViewInstance`, so appearance before the first `resizeMode` prop arrives is
identical.

**Android — the `FontAssetDelegate`** is ported unchanged from v7's property manager, so
text layers can use fonts registered with React Native. `UNSET` matches `ReactFontManager`'s
"unset" sentinel, as v7 used.

**`onDropView` tears down** on both platforms; v7 implemented no cleanup on either. Order
matters: invalidate generations and detach listeners *before* stopping the animation, so
nothing can emit into a torn-down runtime. See item 27.

---

## 7. Source loading

**Fixed precedence** when more than one `source*` is non-empty: `json > name > dotLottie >
url`. v7 had none — the last setter won, i.e. C++ prop declaration order. The fixed order
means a caller bypassing the JS wrapper and sending several source props is still
deterministic. See item 26.

`""` means absent, because the wrapper always sends all four — see item 8.

**The scheme-less bundle-relative URL fallback** applies to `sourceDotLottieURI` as well as
`sourceURL`. v7 applied it to `sourceURL` only, so a bundle-relative `.lottie` path silently
failed. See item 30.

**Android specifics:**

- An explicit cache key is passed only when caching is on. v7 always passed one, which meant
  `cacheComposition: false` was silently ignored for `sourceURL` — the two-arg overloads
  bypass the flag. See item 24.
- `.json` is appended when a name is extensionless, matching iOS. Ported from v7.
- File IO is guarded. v7 let `FileNotFoundException` propagate out of
  `onAfterUpdateTransaction`, crashing on the UI thread instead of reporting, and had no
  `exists()` guard before `FileInputStream`.
- A bundled raw resource is the release-mode counterpart of the metro URL path. When it does
  not resolve, v7 logged via `RNLog.e` *and* left the field set, so every later commit
  early-returned and no prop ever applied again for that view. See items 13 and 25.

**iOS specifics:**

- A `sourceName` that is not found was silent in v7 — a nil animation, no event, a blank
  view. It now reports through `onAnimationFailure`. See item 25.
- `animation` is set to `nil` before an async load starts, blanking the region while
  loading, as v7 did.

---

## 8. Composition-dependent props

`applyCompositionDependent()` is invoked from two places on both platforms: the
composition-loaded listener, and the tail of `afterUpdate()` when the source did not change.
That convergence is what lets the sync and async source paths share one code path.

**Android gates everything here on an actual composition** rather than relying on lottie's
`lazyCompositionTasks`. `clearComposition()` does not clear that queue, so an operation
queued in one commit could replay onto a different source loaded two commits later. See
item 16.

**iOS re-asserts unconditionally** after a `.lottie` load, because such a load overwrites
`loopMode`, `animationSpeed` and `imageProvider` from the manifest. Re-asserting is simpler
than an ordering rule.

---

## 9. Playback and events

**`progress` survives playback start.** iOS folds it into `play(fromProgress:)`. Android
seeks and then calls `resumeAnimation()`, which continues from the current frame, rather
than `playAnimation()`, which resets it. v7 Android applied `progress` first and then called
`playAnimation()`. See item 17.

**Android's finish latch** is reset in `resumeAnimation()`'s path as well as in
`onAnimationStart`, because `resumeAnimation()` does not `notifyStart`.

**iOS's `playbackEpoch`** is incremented when a completion is built, which is what enforces
one emit per run.

**`onAnimationFinish` emits at most once per run.** lottie-android's
`LottieValueAnimator.notifyCancel()` unconditionally calls `notifyEnd()` after
`super.notifyCancel()`, so a cancel is always followed by an end — v7 emitted both. See
item 18.

**`autoPlay: true → false` is a no-op** on both platforms, matching v7. Stopping requires
the imperative `pause()`. See item 29.

---

## 10. Colour handling

`colorFilters[].color` crosses as a packed 32-bit ARGB integer, resolved by React Native's
`processColor` in the JS wrapper — exactly as v7 did. Nothing parses colour strings
natively, which is the point: `processColor` is the only implementation, so the accepted
grammar cannot drift between platforms.

**`src/LottieView/index.tsx` — `processColorFilters`.** Whatever `processColor` takes is
what this takes: hex 3/4/6/8, `rgb()`, `rgba()`, `hsl()`, `hsla()`, `hwb()` and the CSS
colour names. It does *not* accept percentage channels (`rgb(50%, 0%, 0%)`); see the note
in item 28. `processColor` returns `undefined`/`null` for an unparseable string and an
opaque object for `PlatformColor`; neither can cross as a number, so both collapse to
`UNRESOLVED_COLOR`, which is `NaN`.

**Why `NaN` and not `undefined`:** Nitro's `std::optional` converter rejects a JS `null`,
and an absent number would be indistinguishable from a deliberate transparent black.

**Sign conventions differ by platform.** `processColor` masks with `| 0x0` on Android,
giving a signed int32; iOS leaves it unsigned. Both unpackers normalise through a 64-bit
truncation to the same 32-bit pattern rather than trusting the sign.

**`ios/HybridLottieView.swift` — `colorFromARGB`.** Returns nil for the `NaN` sentinel. The
range guard is load-bearing beyond that: `Int64(_: Double)` traps on `NaN` *and* on any
finite value outside `Int64`, so it must never see an unchecked value. Bounding to the
int32/uint32 union is the tightest range `processColor` can legitimately produce.

**`android/…/HybridLottieView.kt` — `colorFromARGB`.** The range check rejects `NaN` for
free — every comparison against `NaN` is false — and also guards the conversion, since
`Double.toInt()` silently saturates rather than failing.

**`reconcileColorFilters` reconciles rather than accumulates** on both platforms. v7 only
ever added value providers/callbacks, so a keypath removed from the array kept its tint for
the view's lifetime. See item 21.

**The failure message names the keypath but not the colour**, because the string that failed
is not available natively — JS resolved it and already logged it in `__DEV__`. See item 28.

**The two keypath shapes deliberately differ**, each v7's verbatim: iOS builds
`"\(keypath).**.Color"`; Android appends the descendant glob and splits on literal dots.

---

## 11. Text filters

An empty array clears, which v7 could not do — it was guarded on `count > 0` (iOS) and
`size() > 0` (Android). See item 21.

**Android must pass `null`, not an empty delegate.** Any present delegate flips
`useTextGlyphs()` off and silently switches text rendering from embedded glyphs to font
rendering. The setter is a bare field store, so `invalidate()` is called explicitly.

**Android's layer type is a View layer type, not a `RenderMode`.** v7 conflated the two
names but not the implementations; this mirrors v7's behaviour, including forcing
`SOFTWARE` rather than `LAYER_TYPE_NONE` when false.

---

## 12. Android registration and JNI

**`android/…/LottieNitroPackage.kt`** — Nitro's autolinking generates the constructor
plumbing but does not register views on Android, so all three of these are required:

1. The class must be named `*Package` and extend a React package. The Community CLI's
   `findPackageClassName` regex is what makes the library autolink at all; without a match
   the Gradle project is never included.
2. `createViewManagers` must return the generated manager, or there is no Java-side view
   creation, prop batching or drop handling.
3. The companion initialiser is load-bearing. The Fabric ComponentDescriptor is registered
   at `JNI_OnLoad`, so the native library must be loaded before the first surface starts.
   Without it React Native falls back to `UnimplementedNativeViewComponentDescriptor`.

**`android/src/main/cpp/cpp-adapter.cpp`** — `registerAllNatives()` is what registers the
Fabric ComponentDescriptor for `LottieView`, via
`JHybridLottieViewStateUpdater::registerNatives`. It only runs once this library has been
loaded, which is why `LottieNitroPackage` forces `System.loadLibrary("LottieNitro")` in its
companion object initialiser.

---

## 13. v7 bugs replicated on purpose

Copied verbatim from v7 so v8's public behaviour is identical and upgrading is not a silent
behavioural change. **They are bugs.** Fix them as a documented breaking change, not quietly.

1. **`duration` → `speed` is rounded to an integer.** `src/LottieView/index.tsx`, from
   `packages/core/src/LottieView/index.tsx`. `Math.round(((op / fr) * 1000) / duration)`
   quantises the speed, so any `duration` that is not an exact divisor of the natural length
   is wrong, and any `duration` over twice the natural length rounds to `0` and freezes the
   animation. Should be a float. It is also gated on `sourceJson`, so `duration` silently
   does nothing for string, URL and `.lottie` sources.
2. **`.lottie` detection is a substring test.** `src/LottieView/utils.ts`, from
   `packages/core/src/LottieView/utils.ts`. `uri.includes('.lottie')` matches
   `https://host/.lottiefiles/a.json`, and misses a real `.lottie` served without that
   literal in the path. Should test the extension or the content type.
3. **`defaultProps.source = undefined` although `source` is required.** This is what makes
   `source` optional at the JSX call site while `render()` warns and returns `null`. Kept
   for API compatibility.
4. **Orphan props kept in the public type with no native counterpart.** `useNativeLooping`
   (Windows-only, and there is no Windows target here), `webStyle`, `hover`, `direction`
   (web-only). They are absent from `src/LottieView.nitro.ts` and dropped by the view config.
   They already did nothing on iOS/Android in v7.
5. **`containerStyle` is accepted by the component but is not in the exported
   `LottieViewProps`.** Reachable via the default export's props only.
6. **No named export.** `import { LottieView } from '…'` does not work, only the default
   export — matching v7 exactly.

---

## 14. v8-only divergences

7. **`colorFilters[].color` crosses as a packed ARGB number.** Resolved by RN's
   `processColor` in the JS wrapper, exactly as v7 did, so the accepted grammar is RN's and
   cannot drift between platforms. v7's full `ProcessedColorValue`
   (`number | NativeColorValue`) is still not expressible in Nitro, so this **drops support
   for `PlatformColor` / `OpaqueColorValue`**, which v7 accepted; those resolve to an opaque
   object and are reported as unresolvable. Restore by adding a parallel prop for the object
   form if it turns out to matter.

   `NaN` is the "JS could not resolve this" sentinel. Both platforms hold the applied colour
   as a raw bit pattern rather than a `Double` so the sentinel compares equal to itself —
   under IEEE equality `NaN != NaN`, which would make an unresolvable entry read as changed
   on every commit and re-emit its failure forever. On iOS that is required; on Android
   Kotlin's data-class total ordering would have covered it, but both sides match
   deliberately.

8. **Empty string means "absent" for the source props.** `src/LottieView/index.tsx` always
   passes all four `source*` props plus `renderMode`, `imageAssetsFolder` and
   `hardwareAccelerationAndroid`, rather than spreading only the one key
   `parsePossibleSources` returns. When an optional prop goes from set to unset React Native
   sends native a JS `null`, but Nitro's `std::optional` converter accepts only `undefined` —
   `null` falls through to `asString()` and throws inside the C++ props parse. Without this,
   changing the source kind (a local name swapped for a remote URI) crashes. The native
   implementations must therefore treat `""` as "no source".

9. **`resizeMode` / `renderMode` are stricter than v7.** They are generated C++ `enum class`
   es, so an unrecognised string now throws at the boundary where v7's plain-string native
   props ignored it. Only callers bypassing TypeScript are affected.

10. **Methods run on the JS thread.** Nitro methods are direct JSI calls, not queued Fabric
    commands. v7's commands arrived already on the UI thread. The implementations must
    marshal to the main/UI thread themselves.

11. **Callbacks no longer bubble.** Nitro uses direct JSI functions and leaves
    `bubblingEventTypes` empty, so the `onAnimation*` events do not propagate to ancestor
    views as they did on Fabric.

---

## 15. Native divergences from v7

The policy for the native layer differs from the JS layer above. v7's JS bugs are replicated
verbatim because they are observable API behaviour. v7's *native* bugs are fixed, because
several are emergent from its batching model rather than intentional and cannot be
reproduced under Nitro's single `afterUpdate()` per batch — and two are outright failure
modes.

**Not reproducible even in principle:**

12. **v7 Android committed eagerly from inside the source setters**, so `commitChanges()` ran
    2+ times per transaction. Its `.lottie` branch used a bare `return` inside a `let` — a
    non-local return out of `commitChanges()` that skipped every remaining prop. Those props
    only landed because a second commit followed. With one `afterUpdate()` per batch,
    replicating that would mean they never apply at all.
13. **v7 Android wedged permanently** on a `.lottie` raw name that did not resolve: the field
    was never cleared, so every later commit hit the same early return and no prop ever
    applied again for that view's lifetime. Now reported through `onAnimationFailure`.

**Structural:**

14. **One `LottieAnimationView` for the component's lifetime on iOS.** `configuration` and
    `animation` are settable vars whose `didSet` rebuilds the layer in place, and
    `makeAnimationLayer` re-applies value providers and carries the image and text providers
    across. v7 constructed a new view per source/renderMode/textFilter change, building it
    two or three times on first mount and silently discarding the text provider whenever
    `renderMode` changed after `textFiltersIOS`.
15. **Single-pass apply with value-based diffing.** Required, not an optimisation: Nitro
    compares props with strict equality, which is reference identity for arrays, so an inline
    `colorFilters={[...]}` arrives "changed" every commit.
16. **Android never queues into `lazyCompositionTasks`.** `clearComposition()` does not clear
    that queue, so an operation queued in one commit could replay onto a different source
    loaded two commits later. Composition-dependent work is gated on `composition != null`
    and driven from the loaded listener.

**Behavioural fixes:**

17. **`progress` survives playback start.** iOS folds it into `play(fromProgress:)`; Android
    seeks then calls `resumeAnimation()` rather than `playAnimation()`. v7 Android applied
    `progress` *before* `autoPlay` then called `playAnimation()`, which reset it.
18. **`onAnimationFinish` emits at most once per run**, never during prop application. v7
    Android emitted twice on cancel, because `LottieValueAnimator.notifyCancel()`
    unconditionally calls `notifyEnd()` after `super.notifyCancel()`. v7 iOS emitted a
    spurious `isCancelled: true` from a `progress` seek, a source swap and a `renderMode`
    change, and emitted nothing after a speed-triggered resume because that `play()` attached
    no completion.
19. **`speed: 0` freezes rather than pausing** on iOS, so no spurious cancel. `speed` no
    longer implicitly starts playback.
20. **Async source loads are last-requested-wins**, via a generation token compared in the
    completion. v7 never cancelled in-flight loads, so the last-*completed* won and rapid
    source changes raced.
21. **`colorFilters` and `textFilters*` can be cleared.** Both reconcile against the
    previously-applied set rather than only adding. v7 guarded both on `count > 0`, so an
    empty array was a no-op and a removed keypath kept its tint for the view's lifetime;
    Android additionally re-added on every commit, accumulating callbacks. Android's clear
    uses `setTextDelegate(null)` plus an explicit `invalidate()` — and specifically `null`,
    not an empty delegate, because any present delegate flips `useTextGlyphs()` off and
    silently switches text rendering from embedded glyphs to font rendering.
22. **A malformed filter entry no longer aborts the rest.** v7 used `break` in both filter
    loops; this uses `continue` and reports the entry.
23. **`imageAssetsFolder` and `cacheComposition` now work on iOS.** v7 declared both in the
    spec and had zero references to either anywhere in its iOS tree.
24. **`cacheComposition: false` is honoured on Android for `sourceURL` and `sourceJson`.** v7
    always passed an explicit cache key, and the two-arg `setAnimation*` overloads bypass the
    flag entirely.
25. **All failures reach `onAnimationFailure`**: iOS `sourceName` not found (silent in v7 —
    nil animation, blank view), Android missing raw resource (v7: `RNLog.e` only), Android
    file IO (v7: a synchronous throw on the UI thread), and colours that cannot be resolved
    (v7: silent transparent fill).
26. **Deterministic source precedence** when more than one `source*` is non-empty:
    json > name > dotLottie > url. v7 had none — last setter won, i.e. C++ prop declaration
    order.
27. **`onDropView` tears down.** v7 implemented no cleanup on either platform. In-flight loads
    invalidated, listeners detached, value callbacks cleared, animation stopped.
28. **A colour that cannot be resolved is reported, not silently applied.** v7 filled
    `Color.TRANSPARENT` and `break`ed out of the whole loop; this reports the keypath through
    `onAnimationFailure` and continues with the remaining entries. The colour grammar itself
    is RN's `processColor`, so it matches v7 exactly — hex 3/4/6/8, `rgb()`, `rgba()`,
    `hsl()`, `hsla()`, `hwb()` and the CSS colour names — and there is no native parser to
    diverge.

    One narrow note for anyone reading the diff: the hand-written parsers this replaced
    accepted percentage channels (`rgb(50%, 0%, 0%)`), and `processColor` does not. Since v7
    called `processColor` too, that is a regression only against v8 code that never shipped,
    and the trade buys `hsl()`, `hwb()` and ~130 more colour names.
29. **`autoPlay: true → false` is a no-op**, matching v7 on both platforms. Stopping requires
    the imperative `pause()`.
30. **The scheme-less bundle-relative URL fallback applies to `sourceDotLottieURI` as well as
    `sourceURL`.** v7 applied it only to the latter, so a bundle-relative `.lottie` path
    silently failed on iOS.

Still deliberately absent: the imperative commands (`play`/`reset`/`pause`/`resume`) are
no-ops pending the ref work, so `example-v8`'s playback buttons are wired but inert.

---

## 16. Testing status

There is no test infrastructure here, and Nitro Modules provides no native testing story: as
of 0.36.5 the entire suite across `react-native-nitro-modules` and `react-native-nitro-test`
is `it.todo('write a test')` — no XCTest, no JUnit, no `androidTest`.

Colour handling used to be the sharp edge, because two hand-written parsers had to accept an
identical grammar with nothing enforcing it. That divergence risk is gone: RN's
`processColor` is now the only implementation, and it is RN's to test.

What remains untested is the unpacking on each side — roughly five lines per platform, plus
the `NaN` sentinel path. Worth covering whenever test infrastructure arrives, in particular:

- Android's signed int32 and iOS's unsigned int32 land on the same colour.
- An unresolvable colour emits `onAnimationFailure` exactly **once**, not on every commit —
  the bit-pattern diffing in section 5 is what makes that true, and it is the kind of thing
  that silently regresses.

---

## 17. The example app

`example-v8/` exists to be run side by side with `example/` and compared. `App.tsx` is v7's
example verbatim, and the **only** intentional difference is the import: it renders the Nitro
implementation via `lottie-react-native-nitro`. The playback buttons are wired but inert
until the imperative commands land.

Keeping that file byte-comparable with `example/App.tsx` is the point, which is why it is
exempt from the comment policy — see below.

---

## 18. Comment carve-outs

The comment policy in the root `AGENTS.md` applies to this package and `example-v8`. Three
files are exempt, all for the same reason: they are deliberately byte-comparable with a v7
counterpart, and stripping them would inflate the diff against code that must not be touched.

| File | Why |
|---|---|
| `packages/nitro/src/types.ts` | Byte-identical to `packages/core/src/types.ts`. Its comments are public API JSDoc that consumers see in their editor, not internal rationale. |
| `packages/nitro/src/LottieView/utils.ts` | Differs from v7's only by the `: any` annotation. Its remaining comment is v7's. |
| `example-v8/App.tsx` | Differs from `example/App.tsx` only by the import. Its remaining comments are v7's. |

Exemption preserves *v7-inherited* comments only. Any comment v8 authored in those files was
still moved here — the `strict: true` note for `utils.ts` is in section 3, and the App.tsx
header is section 17.
