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
9. [Playback and events](#9-playback-and-events) · [Imperative commands](#9a-imperative-commands)
10. [Colour handling](#10-colour-handling)
11. [Text filters](#11-text-filters)
12. [Android registration and JNI](#12-android-registration-and-jni)
13. [v7 bugs replicated on purpose](#13-v7-bugs-replicated-on-purpose) (items 1–6)
14. [v8-only divergences](#14-v8-only-divergences) (items 7–11)
15. [Native divergences from v7](#15-native-divergences-from-v7) (items 12–30) · [Commands](#15a-command-divergences-from-v7) (31–36) · [Unrecorded drops](#15b-unrecorded-drops-now-recorded) (37–38)
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
  src/views/LottieViewConfig.json      vendored codegen output — never edit by hand
  scripts/sync-view-config.js          vendors it, as part of `yarn codegen`
  ios/HybridLottieView.swift  iOS implementation
  android/…/HybridLottieView.kt        Android implementation
  android/…/LottieNitroPackage.kt      RN view registration
  android/src/main/cpp/cpp-adapter.cpp JNI_OnLoad
  nitrogen/generated/         committed codegen output — never edit by hand
```

This package is published as `lottie-react-native`; `packages/core` holds v7 as the private
`lottie-react-native-v7`. The directory names predate that switch. See section 15c for the
packaging details.

`nitrogen/generated` is committed by necessity: the podspec, `build.gradle`,
`CMakeLists.txt` and `src/views/LottieView.ts` all reference generated artifacts, so
a fresh clone cannot even `pod install` without them. Regenerate with
`yarn codegen`; CI fails on any diff.

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
props of the same transaction have been applied.

**`captureRef` deliberately does not call `play()` for `autoPlay`, unlike v7's.** The native
`autoPlay` prop is solely authoritative and already handles first mount, source changes and
progress. v7 fired both as belt-and-braces, which was harmless there only because its JS
call usually hit a nil animation; here it would genuinely double-start and discard the
`progress` prop.

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

## 9a. Imperative commands

`play` / `reset` / `pause` / `resume`, reached through the ref.

**Every command hops to the main/UI thread itself.** v7's Fabric commands arrived already
on the UI thread; Nitro methods are direct JSI calls on the JS thread, and every Lottie
call must be on main. See item 10.

**Deferral until the view is in a window.** A `play()` fired before the view is on screen
would otherwise be dropped — v7 iOS silently did nothing, and v7 Android handled it for
`play` only. Both platforms now defer and replay on attach.

- **iOS — `WindowAttachObserver`.** UIKit has no closure-based attach callback, and
  `LottieAnimationView` cannot be subclassed for one: `LottieAnimationViewBase` overrides
  `didMoveToWindow` without marking it `open`, so an override outside the Lottie module
  does not compile. The workaround is a zero-size, non-interactive child of the animation
  view — when the animation view enters a window so does the child, and `didMoveToWindow`
  fires there, where the override is permitted. The pending closure is held in
  `pendingAttachPlay`.
- **Android — `whenAttached`**, via an `OnAttachStateChangeListener`.

**`play(startFrame, endFrame)` is all-or-nothing**, matching v7 on both platforms: a custom
range needs both frames, and a single `-1` discards the other. A reversed range
(`start > end`) is passed straight through for Lottie to derive direction from. v7 Android
instead swapped the frames and called `reverseAnimationSpeed()`, which permanently flipped
the view's speed field, so a later plain `play()` still ran backwards and fought the `speed`
prop.

**Android restores the composition's full range** when no custom range is given, but only if
it actually differs. It then uses `playAnimation()`, which restarts at the new segment's
start frame — what a range change wants; `resumeAnimation()` would continue in place.

**`reset()`** emits `isCancelled: true` on both platforms, by different routes. iOS seeks
then stops, in that order, as v7 did: the seek fires the pending completion. Android cancels
then seeks, as v7 did: `cancelAnimation()` fires `onAnimationCancel`, and the
`onAnimationEnd` that lottie-android always sends afterwards is swallowed by the latch in
`emitFinish`.

**`pause()` on Android is the one place an emit has to be explicit.** `pauseAnimation()`
notifies neither cancel nor end, so nothing would fire. v7 Android emitted nothing here
while v7 iOS and web both emitted `isCancelled: true`; the platforms converged on emitting.

**`resume()` resumes in place**, preserving any range a prior `play(from:to:)` set rather
than silently replaying the whole composition, which is what v7 iOS did. On Android,
`resumeAnimation()` does not `notifyStart`, so the finish latch is reset here too —
otherwise a preceding `pause()`, which set it, would swallow the natural finish.

**None of the iOS commands are wrapped in `withFinishSuppressed`, deliberately.** `pause()`
and `currentProgress = 0` both cause Lottie to invoke the stored completion with
`finished: false`, which is exactly the `onAnimationFinish(isCancelled: true)` these should
emit; suppressing would swallow it. If no play was ever in flight there is no completion and
nothing emits, which is correct — there was no run to cancel.

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

---

## 15a. Command divergences from v7

The four imperative commands are implemented. Where v7's platforms disagreed with each
other, they are converged. Section 9a covers the mechanics; these are the observable
differences.

31. **A reversed range (`play(10, 0)`) is passed through** for Lottie to derive direction
    from, on both platforms — v7 iOS's behaviour. v7 Android instead swapped the frames and
    called `reverseAnimationSpeed()`, which permanently flipped the view's `speed` field: a
    later plain `play()` still ran backwards, and it fought the `speed` prop until that prop
    next changed.
32. **`pause()` and `reset()` both emit `onAnimationFinish(isCancelled: true)`** on both
    platforms. v7 emitted on both from iOS, on `reset` only from Android (and twice), and on
    `pause` from web. Android's `pause()` is the one place the emit is explicit, since
    `pauseAnimation()` notifies neither cancel nor end.
33. **`resume()` preserves a range set by a prior `play(from, to)`** — v7 Android's
    behaviour. v7 iOS discarded it and silently replayed the whole composition, which made
    `resume()` widen what was playing.
34. **`play()` issued while the view is detached is deferred until it attaches**, on both
    platforms. v7 did this for Android's `play` only, so on iOS the call was silently
    dropped; and even on Android `reset`/`pause`/`resume` did nothing when detached rather
    than deferring.
35. **Commands marshal to the main/UI thread themselves.** Nitro delivers methods as direct
    JSI calls on the JS thread, where v7's Fabric commands already arrived on the UI thread.
    See item 10.
36. **`autoPlay` is driven only by the native prop.** v7's JS `captureRef` also called
    `play()` when `autoPlay` was true; that was harmless there because the call usually hit
    a nil animation, but with commands implemented it would double-start and discard the
    `progress` prop.

---

## 15b. Unrecorded drops, now recorded

Found by audit rather than decided at the time. Documented so they are choices rather than
accidents.

37. **tvOS is dropped.** `LottieNitro.podspec` declares `:ios` only, where
    `packages/core/lottie-react-native.podspec` declares ios, osx, tvos and visionos. macOS
    and visionOS were dropped deliberately (Nitro Views are iOS + Android only, item 4 and
    the scaffold's platform decision), but tvOS was never called out. It is the same
    constraint — there is no Nitro View for tvOS — but v7 did support it, so this is a
    platform regression for anyone on tvOS.
38. **`onAnimationLoop` is a fourth orphan prop**, missing from item 4's list. It is in the
    public `LottieViewProps`, absent from `LottieView.nitro.ts`, and absent from the
    generated view config. Windows and web only in v7, so it already did nothing on
    iOS/Android — same class as `useNativeLooping`, `webStyle`, `hover` and `direction`.
    Note `defaultProps` also sets `useNativeLooping: false`, an orphan default that is never
    read by anything.

---

## 15c. Build configuration

The build and config files carry no hand-written comments either — only upstream template
text. Everything the port decided is here.

### `example-v8/ios/Podfile` — the resource-bundle deployment target hook

**Do not delete `raise_resource_bundle_deployment_targets` without reading this.** It looks
redundant and is not; removing it breaks the iOS build.

React Native's `ReactNativePodsUtils.updateOSDeploymentTarget` raises pods to
`min_ios_version_supported`, but it only walks each pod's `native_target`. Targets generated
from a podspec's `resource_bundles` are left alone and keep whatever that podspec declared,
and the platform `react-native-test-app` sets does not reach them either — CocoaPods derives
a pod target's platform in `Analyzer#determine_platform`, which reads only the podspec, so a
Podfile-level `platform :ios` cannot reach it. A dependency that still supports iOS 13
therefore produces a bundle target below the minimum Xcode accepts:

```
lottie-ios                    -> 15.1  (raised by React Native)
lottie-ios-LottiePrivacyInfo  -> 13.0  (from the podspec, unchanged)
```

The build then fails before anything compiles, with
`The iOS Simulator deployment target 'IPHONEOS_DEPLOYMENT_TARGET' is set to 13.0, but the
range of supported deployment target versions is 15.0 to 27.0.x`. Note `pod install`
*succeeds* — only the build fails, which is why this looks removable.

`lottie-ios` still declares iOS 13.0 as of 4.6.1, so bumping it does not help. The hook only
ever raises a target to React Native's own floor; anything already at or above it is
untouched. Remove it once the upstream helper covers resource bundles.

The same hook exists in `example/ios/Podfile` (v7). It became necessary here the moment
`lottie-ios` entered `LottieNitro.podspec`.

### `packages/nitro/package.json` — the published package

This package is what consumers install as `lottie-react-native`. `packages/core` keeps the
v7 implementation under `lottie-react-native-v7` and is `private`, so two workspaces do not
compete for one npm name.

- **`react-native-builder-bob`, matching `packages/core`.** `main`/`module`/`types` point at
  `lib/`, and `react-native`/`source` at `src/index.tsx`. Publishing source only would have
  been simpler, but v7 shipped a compiled `lib/` and dropping it breaks every consumer whose
  toolchain has no React Native Babel preset — jest, plain Node, webpack, Next.
- **`ios/PrivacyInfo.xcprivacy` is listed in `files` explicitly.** The two `ios/**` globs
  above it match only source extensions, so the manifest the podspec declares in
  `resource_bundles` was absent from the tarball while being referenced by the pod. Verify
  with `npm pack --dry-run`, not by reading the globs.
- **No `react-native-windows` peer dependency**, unlike v7 — see item 4 and section 1 for
  why v8 is iOS and Android only.

### `packages/nitro/src/views/LottieViewConfig.json` and `scripts/sync-view-config.js`

`src/views/LottieView.ts` needs nitrogen's generated view config at runtime. It originally
deep-imported `../../nitrogen/generated/shared/json/LottieViewConfig.json`, which cannot
survive a bob build: bob copies non-source files out of `src` verbatim but never rewrites
import specifiers, so from `lib/commonjs/views/` that path resolves to `lib/nitrogen/…`,
which does not exist.

The specifier has to be correct from **two** depths at once — `src/views/` for Metro, which
resolves the `react-native` field, and `lib/*/views/` for published consumers, which resolve
`main`. One relative path out of `src` cannot do that, so the generated file is vendored to
`src/views/LottieViewConfig.json` and imported as `./LottieViewConfig.json`. bob then copies
it into both `lib/commonjs/views/` and `lib/module/views/`.

`scripts/sync-view-config.js` writes that copy and runs as the second half of the package's
`nitrogen` script, so `yarn codegen` cannot regenerate the config without re-vendoring it.
The copy is committed and CI drift-checks it on the same `git diff --exit-code` as
`nitrogen/generated` — it is generated output, and hand-editing it would silently desync the
view config from the spec. `--check` compares without writing, for a fast local check that
does not need the nitrogen toolchain.

### `packages/nitro/tsconfig.json`

`compilerOptions.noEmit` is deliberately **absent**, matching `packages/core`. bob's
typescript target refuses to run when the tsconfig it reads defines `noEmit`,
`emitDeclarationOnly`, `declarationDir`, or a conflicting `outDir`; it passes
`--emitDeclarationOnly --outDir` itself. The `typecheck` script gets `--noEmit` on the
command line instead, where bob cannot see it. `lib` is excluded so `tsc` does not re-read
its own output.

### `packages/nitro/LottieNitro.podspec`

- `s.name` must match `iosModuleName` in `nitro.json` — the generated Swift/C++ bridge
  headers are namespaced by it.
- Swift 5.9 is required by `lottie-ios` 4.6.0.
- `load 'nitrogen/generated/ios/LottieNitro+autolinking.rb'` adds every nitrogen-generated
  source, the NitroModules dependency, and the c++20 / objcxx interop build settings the
  generated bridge requires.
- `lottie-ios` is pinned exactly, matching `packages/core/lottie-react-native.podspec`, so
  any rendering difference between v7 and v8 comes from our code rather than a different
  Lottie.
- The privacy manifest matches `packages/core`. The root README states the library ships one
  by default, which was not true for this package until it was added.

### `packages/nitro/android/build.gradle`

- **Deliberately no `buildscript { classpath "com.android.tools.build:gradle" }` block.**
  Both AGP and the Kotlin plugin are already on the root project's classpath —
  `react-native-test-app`'s `getReactNativeDependencies()` provides them — and Gradle's
  parent-first classloader delegation means a local pin would be ignored at best and
  conflict at worst.
- **Deliberately no `libraryName` and no `apply plugin: "com.facebook.react"`.** This module
  uses zero React Native codegen; it uses nitrogen. React Native's autolinker emits
  `add_subdirectory(<lib>/android/build/generated/source/codegen/jni)` for any dependency
  declaring a `libraryName`, which would point CMake at a directory that is never generated.
- `nitrogen/generated/android/kotlin` is added to `java.srcDirs`. Without it the generated
  `HybridLottieViewSpec`, `HybridLottieViewManager` and `LottieNitroOnLoad` do not exist.
- Prefab is enabled because the nitrogen-generated CMake does
  `find_package(fbjni / ReactAndroid / react-native-nitro-modules REQUIRED)`.
- `lottie` is pinned to match `packages/core/android/build.gradle`, for the same
  same-renderer reason as the podspec. It brings `androidx.appcompat` transitively, which
  `LottieAnimationView` needs — it extends `AppCompatImageView`.
- `react-native-nitro-modules` provides the NitroModules prefab and
  `com.margelo.nitro.R.id.associated_hybrid_view_tag`, which the generated view manager
  imports.

### `packages/nitro/android/CMakeLists.txt`

The library name must match `androidCxxLibName` in `nitro.json` — the generated
`LottieNitroOnLoad.kt` calls `System.loadLibrary("LottieNitro")` and the generated
autolinking CMake does `target_sources(LottieNitro …)`. The included
`LottieNitro+autolinking.cmake` adds all nitrogen-generated C++ sources plus fbjni /
ReactAndroid / NitroModules linkage.

### `packages/nitro/android/gradle.properties`

Fallbacks only. When built inside an app, `react-native-test-app` populates
`rootProject.ext` from React Native's own version catalog and these are unused. The values
are aligned to React Native 0.84.1's `gradle/libs.versions.toml`.

### `example-v8/android/gradle.properties`

- `android.builtInKotlin=false` — `react-native-test-app` applies the Kotlin plugin itself,
  so opt out of AGP's built-in Kotlin support to avoid applying it twice.
- The AGP 9 DSL is not yet supported by the React Native Gradle plugin.
- Edge-to-edge is enabled to draw behind the system bars, matching the React Native default.
- **The New Architecture is forced on here** rather than passed per-invocation with
  `ORG_GRADLE_PROJECT_newArchEnabled`, unlike `example/`. Two reasons: Nitro Views are
  New-Architecture-only, and `react-native-nitro-modules` gates its own setup on the *root*
  project property — which the per-invocation and `react-native-test-app`
  `gradle.beforeProject` paths do not reliably reach.

### `example-v8/metro.config.js`

`nmHoistingLimits: workspaces` gives every workspace its own `node_modules`, so the
symlinked library would otherwise resolve its own copy of react / react-native. Forcing the
app's copy for each peer dependency keeps a single instance of each. The asset extension
list is extended so dotLottie files can be imported.

### `example-v8/webpack.config.js`

`.web.tsx` comes first in `resolve.extensions`, which is what makes the nitro package
resolve to its web shim rather than the native entry point — the latter deep-imports Flow
source that cannot be bundled for web. The `react-native` → `react-native-web` alias is
written after the `extraNodeModules` spread so it wins. `__DEV__` is defined explicitly per
[react-native-web#349](https://github.com/necolas/react-native-web/issues/349).

### `example-v8/Gemfile`

Ruby 3.4.0 removed several libraries from the standard library, hence the explicit
`bigdecimal`, `logger`, `benchmark` and `mutex_m` gems. `kconv` also left the standard
library in 3.4 and is provided by `nkf`; CFPropertyList requires it, so CocoaPods fails to
even parse the Podfile with `cannot load such file -- kconv`. `xcodeproj` declares `nkf`
itself from 1.26 onwards, but the pin above it holds this repo below that version.

### `packages/nitro/ios/.swiftlint.yml`

Starts from `packages/core/ios/.swiftlint.yml` and adds the deltas this package needs, kept
as a separate file rather than shared — matching how core owns its own.

`HybridLottieView.swift` is deliberately a single file: it is one coalesced
apply-and-playback state machine, and splitting it across extensions would scatter the
ordering rules that make it correct. The length and complexity thresholds are raised to fit
it, rather than the file being carved up to satisfy the defaults.

The `todo` rule is left enabled. It was disabled while the port's comments cross-referenced
a divergence log by name; with the sources carrying no comments at all it cannot fire, and
leaving it on enforces a corner of the comment policy for free.

### `example-v8/tsconfig.json`

`compilerOptions.types` is set to `[]` because the base `@react-native/typescript-config`
sets `"types": ["jest"]`, and this app has no jest — `tsc` fails with TS2688 without the
override.

### `.gitignore`

`packages/nitro/nitrogen/generated/` is intentionally **not** ignored — see section 1.
`example-v8/ios/Podfile.lock` is written by `pod install`, which `react-native-test-app`
regenerates on each run.

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
example verbatim, and the **only** intentional difference is the import.

Since v8 took the `lottie-react-native` name, the direction of that difference flipped:
`example-v8/App.tsx` now carries the plain `lottie-react-native` import and it is
`example/App.tsx` that was changed, to `lottie-react-native-v7`. The invariant is unchanged
— the two files still differ by one import line — but the diff now reads the other way
round.

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
