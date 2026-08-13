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
