# Migrating from v7 to v8

> **Work in progress.** v8 is not released, and `lottie-react-native` still ships
> v7. This document is being written alongside the port so the breaking changes
> are recorded as they are made rather than reconstructed afterwards. Expect it
> to grow.

v8 rewrites the native layer on [Nitro Modules](https://nitro.margelo.com),
replacing React Native's codegen with `nitrogen`.

## The good news: the JavaScript API is unchanged

`LottieViewProps`, `AnimationObject`, the four imperative ref methods
(`play`/`reset`/`pause`/`resume`) and the default-export shape are all identical
to v7. This is verified with a type-level check that v7's and v8's props are
mutually assignable, not by inspection. If you only use documented props, your
component code should need no changes.

The breaking changes below are all in behaviour or platform support.

## Platform support is narrower

**v8 supports iOS and Android only.** Nitro Views are Fabric-only, so macOS,
visionOS, Windows and tvOS have no implementation. v7 supported all four.

The web implementation is unaffected and still works through the optional
`@lottiefiles/dotlottie-react` peer dependency.

## `colorFilters` no longer accepts `PlatformColor`

v8 resolves colours with React Native's `processColor`, exactly as v7 did, so
the accepted colour strings are unchanged: `#RGB`, `#RGBA`, `#RRGGBB`,
`#RRGGBBAA`, `rgb()`, `rgba()`, `hsl()`, `hsla()`, `hwb()` and the CSS colour
names all work as before.

What changed is only the object form. v7 sent a `ProcessedColorValue`, which is
`number | NativeColorValue`; Nitro cannot express that union, so v8 sends the
number alone.

**Not accepted:** `PlatformColor(...)`, `DynamicColorIOS(...)`, or any other
`OpaqueColorValue`.

```jsx
// v7 — no longer works
colorFilters={[{ keypath: 'BG', color: PlatformColor('systemBlue') }]}

// v8
colorFilters={[{ keypath: 'BG', color: '#007AFF' }]}
```

Colours that cannot be resolved now report through `onAnimationFailure` rather
than silently filling transparent, and one bad entry no longer aborts the rest
of the array.

## `resizeMode` and `renderMode` are strict

They are generated C++ enums, so an unrecognised value throws at the native
boundary where v7 silently ignored it. The TypeScript types have always been
narrow unions, so this only affects callers bypassing TypeScript.

## `onAnimation*` callbacks no longer bubble

Nitro uses direct JSI functions, so these events do not propagate to ancestor
views. If you relied on catching them on a parent, attach the handler to the
`LottieView` itself.

## `onAnimationFinish` fires more predictably

v7's behaviour differed per platform and fired spuriously. v8 emits **at most
once per playback run**, never during prop application, and never while looping.

Concretely, changes you may notice:

- **Android no longer double-fires on cancel.** v7 emitted twice, because
  lottie-android always follows a cancel with an end.
- **Prop changes no longer emit.** On v7 iOS, seeking `progress`, swapping
  `source` or changing `renderMode` each produced a spurious
  `isCancelled: true`.
- **`pause()` now emits `isCancelled: true` on Android.** v7 emitted on iOS and
  web but not Android.
- **`speed={0}` no longer emits.** v7 iOS treated it as a pause, which produced a
  spurious cancel.

## Imperative command behaviour is converged

v7's platforms disagreed; v8 picks one behaviour for both.

- **`resume()` after `play(from, to)` stays within that range.** v7 iOS discarded
  the range and replayed the whole composition.
- **A reversed range (`play(10, 0)`) plays backwards without side effects.** v7
  Android permanently flipped the view's speed, so a *later* plain `play()` also
  ran backwards and fought the `speed` prop.
- **`play()` before the view is on screen is deferred, not dropped.** v7 dropped
  it on iOS.

## Behaviour deliberately kept, bugs included

So that upgrading is not a silent change, some v7 JavaScript bugs are reproduced
exactly. They will be fixed in a later major, as documented changes:

- `duration` is converted to an integer `speed`, so a duration that is not an
  exact divisor of the animation's natural length is wrong, and one over twice
  that length freezes the animation. It is also ignored for anything but JSON
  sources.
- `.lottie` detection is a substring test, so a URL containing `.lottie`
  anywhere is treated as a dotLottie archive.

See `packages/nitro/ARCHITECTURE.md` for the complete divergence log, including the
internal changes that are not user-facing.
