# Deliberate carry-overs and known divergences

## v7 bugs replicated on purpose

These are copied verbatim from lottie-react-native v7 so v8's public behaviour
is identical and upgrading is not a silent behavioural change. They are bugs.
Fix them as a documented breaking change, not quietly.

1. **`duration` → `speed` is rounded to an integer.**
   `src/LottieView/index.tsx`, from `packages/core/src/LottieView/index.tsx`.
   `Math.round(((op / fr) * 1000) / duration)` quantises the speed, so any
   `duration` that is not an exact divisor of the natural length is wrong, and
   any `duration` over twice the natural length rounds to `0` and freezes the
   animation. Should be a float. It is also gated on `sourceJson`, so `duration`
   silently does nothing for string, URL and `.lottie` sources.

2. **`.lottie` detection is a substring test.**
   `src/LottieView/utils.ts`, from `packages/core/src/LottieView/utils.ts`.
   `uri.includes('.lottie')` matches `https://host/.lottiefiles/a.json`, and
   misses a real `.lottie` served without that literal in the path. Should test
   the extension or the content type.

3. **`defaultProps.source = undefined` although `source` is required.**
   This is what makes `source` optional at the JSX call site while `render()`
   warns and returns `null`. Kept for API compatibility.

4. **Orphan props kept in the public type with no native counterpart.**
   `useNativeLooping` (Windows-only, and there is no Windows target here),
   `webStyle`, `hover`, `direction` (web-only). They are absent from
   `src/LottieView.nitro.ts` and dropped by the view config. They already did
   nothing on iOS/Android in v7.

5. **`containerStyle` is accepted by the component but is not in the exported
   `LottieViewProps`.** Reachable via the default export's props only.

6. **No named export.** `import { LottieView } from '…'` does not work, only the
   default export — matching v7 exactly.

## v8-only divergences

7. **`colorFilters[].color` crosses as a plain string.**
   v7 ran `processColor` in JS and sent a `ProcessedColorValue`. Nitro cannot
   express that type, so the string crosses unparsed and each platform parses it
   natively. This **drops support for `PlatformColor` / `OpaqueColorValue`**,
   which v7 accepted. Restore it by adding an optional pre-processed int
   alongside the string if it turns out to matter.

8. **Empty string means "absent" for the source props.**
   `src/LottieView/index.tsx` always passes all four `source*` props plus
   `renderMode`, `imageAssetsFolder` and `hardwareAccelerationAndroid`, rather
   than spreading only the one key `parsePossibleSources` returns. When an
   optional prop goes from set to unset React Native sends native a JS `null`,
   but Nitro's `std::optional` converter accepts only `undefined` — `null` falls
   through to `asString()` and throws inside the C++ props parse. Without this,
   changing the source kind (a local name swapped for a remote URI) crashes.
   The native implementations must therefore treat `""` as "no source".

9. **`resizeMode` / `renderMode` are stricter than v7.**
   They are generated C++ `enum class`es, so an unrecognised string now throws
   at the boundary where v7's plain-string native props ignored it. Only callers
   bypassing TypeScript are affected.

10. **Methods run on the JS thread.**
    Nitro methods are direct JSI calls, not queued Fabric commands. v7's
    commands arrived already on the UI thread. The real implementations must
    marshal to the main/UI thread themselves.

11. **Callbacks no longer bubble.** Nitro uses direct JSI functions and leaves
    `bubblingEventTypes` empty, so the `onAnimation*` events do not propagate to
    ancestor views as they did on Fabric.

## Native divergences from v7 (props implementation)

The policy for the native layer differs from the JS layer above. v7's JS bugs are
replicated verbatim because they are observable API behaviour. v7's *native* bugs
are fixed, because several are emergent from its batching model rather than
intentional and cannot be reproduced under Nitro's single `afterUpdate()` per
batch — and two are outright failure modes.

Not reproducible even in principle:

12. **v7 Android committed eagerly from inside the source setters**, so
    `commitChanges()` ran 2+ times per transaction. Its `.lottie` branch used a
    bare `return` inside a `let` — a non-local return out of `commitChanges()`
    that skipped every remaining prop. Those props only landed because a second
    commit followed. With one `afterUpdate()` per batch, replicating that would
    mean they never apply at all.
13. **v7 Android wedged permanently** on a `.lottie` raw name that did not
    resolve: the field was never cleared, so every later commit hit the same
    early return and no prop ever applied again for that view's lifetime. Now
    reported through `onAnimationFailure`.

Structural:

14. **One `LottieAnimationView` for the component's lifetime on iOS.**
    `configuration` and `animation` are settable vars whose `didSet` rebuilds the
    layer in place, and `makeAnimationLayer` re-applies value providers and
    carries the image and text providers across. v7 constructed a new view per
    source/renderMode/textFilter change, building it two or three times on first
    mount and silently discarding the text provider whenever `renderMode` changed
    after `textFiltersIOS`.
15. **Single-pass apply with value-based diffing.** Required, not an optimisation:
    Nitro compares props with strict equality, which is reference identity for
    arrays, so an inline `colorFilters={[...]}` arrives "changed" every commit.
16. **Android never queues into `lazyCompositionTasks`.** `clearComposition()`
    does not clear that queue, so an operation queued in one commit could replay
    onto a different source loaded two commits later. Composition-dependent work
    is gated on `composition != null` and driven from the loaded listener.

Behavioural fixes:

17. **`progress` survives playback start.** iOS folds it into
    `play(fromProgress:)`; Android seeks then calls `resumeAnimation()` rather
    than `playAnimation()`. v7 Android applied `progress` *before* `autoPlay` then
    called `playAnimation()`, which reset it.
18. **`onAnimationFinish` emits at most once per run**, never during prop
    application. v7 Android emitted twice on cancel, because
    `LottieValueAnimator.notifyCancel()` unconditionally calls `notifyEnd()` after
    `super.notifyCancel()`. v7 iOS emitted a spurious `isCancelled: true` from a
    `progress` seek, a source swap and a `renderMode` change, and emitted nothing
    after a speed-triggered resume because that `play()` attached no completion.
19. **`speed: 0` freezes rather than pausing** on iOS, so no spurious cancel.
    `speed` no longer implicitly starts playback.
20. **Async source loads are last-requested-wins**, via a generation token
    compared in the completion. v7 never cancelled in-flight loads, so the
    last-*completed* won and rapid source changes raced.
21. **`colorFilters` and `textFilters*` can be cleared.** Both reconcile against
    the previously-applied set rather than only adding. v7 guarded both on
    `count > 0`, so an empty array was a no-op and a removed keypath kept its tint
    for the view's lifetime; Android additionally re-added on every commit,
    accumulating callbacks. Android's clear uses `setTextDelegate(null)` plus an
    explicit `invalidate()` — and specifically `null`, not an empty delegate,
    because any present delegate flips `useTextGlyphs()` off and silently switches
    text rendering from embedded glyphs to font rendering.
22. **A malformed filter entry no longer aborts the rest.** v7 used `break` in
    both filter loops; this uses `continue` and reports the entry.
23. **`imageAssetsFolder` and `cacheComposition` now work on iOS.** v7 declared
    both in the spec and had zero references to either anywhere in its iOS tree.
24. **`cacheComposition: false` is honoured on Android for `sourceURL` and
    `sourceJson`.** v7 always passed an explicit cache key, and the two-arg
    `setAnimation*` overloads bypass the flag entirely.
25. **All failures reach `onAnimationFailure`**: iOS `sourceName` not found
    (silent in v7 — nil animation, blank view), Android missing raw resource (v7:
    `RNLog.e` only), Android file IO (v7: a synchronous throw on the UI thread),
    and unparseable colour strings (v7: silent transparent fill).
26. **Deterministic source precedence** when more than one `source*` is non-empty:
    json > name > dotLottie > url. v7 had none — last setter won, i.e. C++ prop
    declaration order.
27. **`onDropView` tears down.** v7 implemented no cleanup on either platform.
    In-flight loads invalidated, listeners detached, value callbacks cleared,
    animation stopped.
28. **Colour strings are parsed by a shared grammar** implemented identically on
    both platforms (`LottieColorParser.swift` / `.kt`): `#RGB`, `#RGBA`,
    `#RRGGBB`, `#RRGGBBAA`, `rgb()`, `rgba()`, CSS Level 1 names. Deliberately
    *not* `Color.parseColor` on Android, which supports hex and names but not
    `rgb()`/`rgba()` and would have diverged from iOS. Still narrower than v7,
    which ran RN's `processColor` in JS and so accepted `hsl()` and everything
    else RN supports.
29. **`autoPlay: true → false` is a no-op**, matching v7 on both platforms.
    Stopping requires the imperative `pause()`.
30. **The scheme-less bundle-relative URL fallback applies to
    `sourceDotLottieURI` as well as `sourceURL`.** v7 applied it only to the
    latter, so a bundle-relative `.lottie` path silently failed on iOS.

Still deliberately absent: the imperative commands (`play`/`reset`/`pause`/
`resume`) are no-ops pending the ref work, so `example-v8`'s playback buttons are
wired but inert.

## Untested: the colour parsers

`LottieColorParser.swift` and `LottieColorParser.kt` have **no automated tests**.
Deliberate, not an oversight — recorded here so it can be revisited.

Nitro Modules provides no native testing story: as of 0.36.5 the entire test
suite in its own repository, across `react-native-nitro-modules` and
`react-native-nitro-test`, is `it.todo('write a test')`. There is no XCTest, no
JUnit, no `androidTest`. This repository has no test infrastructure either.

The parsers do not actually depend on any of that — they are plain Swift and
plain Kotlin — but testing them needs work neither platform gives for free:

- **Android**: `android.graphics.Color.argb` is stubbed in plain JUnit and
  throws. Needs either Robolectric, or hand-packing the int
  (`(a shl 24) or (r shl 16) or (g shl 8) or b`) so the parser becomes pure
  Kotlin.
- **iOS**: returning `UIColor` ties it to UIKit, and there is no test target —
  `react-native-test-app` generates the Xcode project and overwrites it on every
  `pod install`. Would need the parser to return neutral RGBA components
  (arguably better anyway, since Lottie wants `LottieColor(r:g:b:a:)` and the
  `UIColor` round-trip is incidental) plus a small SwiftPM package for
  `swift test`.

**The risk this leaves open** is the one worth remembering: the two parsers are
hand-written to accept an identical set, and nothing enforces that. A shared
fixture table asserted on both sides is what would catch divergence. Until then,
only the hex path is exercised in practice — `example/App.tsx` uses `#1652f0` and
`#64E9FF`, so `rgb()`, `rgba()`, percentages and the named colours are unverified
on either platform.
