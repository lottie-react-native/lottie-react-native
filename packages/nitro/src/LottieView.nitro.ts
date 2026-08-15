import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules';

/**
 * How the animation is scaled inside the view.
 *
 * Mirrors the public `LottieViewProps['resizeMode']`. This has to be a named
 * `type` alias — nitrogen rejects inline string-literal unions ("Inline union
 * types are not supported by Nitrogen!"). As a named alias it generates a C++
 * `enum class` whose JSI converter maps the JS string both ways, so the wire
 * format stays `'contain'` exactly as in v7.
 */
export type ResizeMode = 'cover' | 'contain' | 'center';

/**
 * How Lottie renders. Mirrors the public `LottieViewProps['renderMode']`.
 */
export type RenderMode = 'AUTOMATIC' | 'HARDWARE' | 'SOFTWARE';

/**
 * One layer whose color is overridden.
 *
 * `color` crosses as a packed 32-bit ARGB integer, already resolved by React
 * Native's `processColor` in the JS wrapper — exactly as v7 did. Nothing parses
 * colour strings natively, which is the point: `processColor` is the only
 * implementation, so the accepted grammar cannot drift between platforms.
 *
 * The sign convention differs by platform (`processColor` masks with `| 0x0` on
 * Android, giving a signed int32; iOS leaves it unsigned), so both sides
 * normalise through a 64-bit truncation to the same 32-bit pattern rather than
 * trusting the sign.
 *
 * `NaN` is the sentinel for "JS could not resolve this colour" — see the wrapper
 * in `src/LottieView/index.tsx`. Native reports it through `onAnimationFailure`
 * and skips that entry. It cannot be `undefined`: Nitro's `std::optional`
 * converter rejects a JS `null`, and an absent number would be indistinguishable
 * from a deliberate transparent black.
 *
 * `PlatformColor`/`OpaqueColorValue` remain unsupported — `processColor` returns
 * an opaque object for those and Nitro cannot express the union. See TODO.md.
 *
 * Named `LottieColorFilter` rather than `ColorFilter` because the generated
 * Kotlin data class lands in the same package as `HybridLottieView.kt`, where
 * plain `ColorFilter` would shadow `android.graphics.ColorFilter` once the real
 * Android implementation needs it. The public type in `types.ts` keeps v7's
 * `ColorFilter` name.
 */
export interface LottieColorFilter {
  keypath: string;
  color: number;
}

/**
 * An iOS text layer override, addressed by keypath.
 */
export interface TextFilterIOS {
  keypath: string;
  text: string;
}

/**
 * An Android text find/replace pair.
 */
export interface TextFilterAndroid {
  find: string;
  replace: string;
}

/**
 * The native prop surface, translated from v7's
 * `packages/core/src/specs/LottieAnimationViewNativeComponent.ts`.
 *
 * This is NOT the public API — `LottieViewProps` in `../types` is. The wrapper
 * in `../LottieView/index.tsx` translates between them, exactly as v7's wrapper
 * translates to its codegen spec.
 *
 * Deliberately absent, and why:
 * - `style`, `testID`, `onLayout`, `pointerEvents` and every other `ViewProps`:
 *   the generated props class extends `react::ViewProps` and React Native
 *   merges `PlatformBaseViewConfig.validAttributes`. Declaring them here would
 *   double-parse them.
 * - `hybridRef`: injected by the generator, never declared.
 * - `dummy`: v7 needed it only to work around an RN codegen bug with
 *   `ReadonlyArray<Object>`. Nitrogen has no such bug.
 * - `useNativeLooping` (Windows), `webStyle`/`hover`/`direction` (web): no
 *   native counterpart on a Nitro view, which is iOS + Android only. They stay
 *   in the public `LottieViewProps` and are dropped by the view config.
 *
 * No property may be `readonly`: `Property.cppSetter` returns undefined for
 * readonly props, but both view generators still emit `setX(...)` calls, which
 * then don't exist natively.
 */
export interface NativeLottieViewProps extends HybridViewProps {
  resizeMode?: ResizeMode;
  renderMode?: RenderMode;

  sourceName?: string;
  sourceJson?: string;
  sourceURL?: string;
  sourceDotLottieURI?: string;

  imageAssetsFolder?: string;

  /** v7 typed this `Float`; Nitro has a single `double` number type. */
  progress?: number;
  speed?: number;

  loop?: boolean;
  autoPlay?: boolean;

  enableMergePathsAndroidForKitKatAndAbove?: boolean;
  applyOpacityToLayersAndroid?: boolean;
  enableSafeModeAndroid?: boolean;
  hardwareAccelerationAndroid?: boolean;
  cacheComposition?: boolean;

  /**
   * Must be a mutable array type. `ReadonlyArray<T>` is not recognised by
   * ts-morph's `Type.isArray()`, so nitrogen would fall through and try to
   * build a struct literally named `ReadonlyArray`.
   */
  colorFilters?: LottieColorFilter[];
  textFiltersAndroid?: TextFilterAndroid[];
  textFiltersIOS?: TextFilterIOS[];

  /**
   * v7 delivered these as Fabric bubbling events carrying `{ isCancelled }` /
   * `{ error }` / `{}` payloads. Nitro callbacks are direct JSI functions, so
   * the payload objects collapse to plain parameters — and `onAnimationLoaded`
   * has none at all, since nitrogen rejects empty structs.
   *
   * They return `void` so they stay fire-and-forget; a non-void return would
   * become a `Promise` on the native side.
   *
   * Every call site must wrap these with `callback(...)`. The public wrapper
   * does that, so end users keep passing plain functions.
   */
  onAnimationFinish?: (isCancelled: boolean) => void;
  onAnimationFailure?: (error: string) => void;
  onAnimationLoaded?: () => void;
}

/**
 * v7's `codegenNativeCommands`, as Nitro methods reachable through the ref.
 *
 * v7 typed the frames as `Int32`; Nitro has only `double`. The public
 * `play(startFrame?, endFrame?)` still passes `-1` for "unset", verbatim.
 */
export interface NativeLottieViewMethods extends HybridViewMethods {
  play(startFrame: number, endFrame: number): void;
  reset(): void;
  pause(): void;
  resume(): void;
}

/**
 * The name of this alias is load-bearing. Nitrogen reads
 * `type.getAliasSymbolOrThrow()` and derives every generated name from it —
 * `HybridLottieViewSpec`, `HybridLottieViewManager`, the Fabric component name
 * and `uiViewClassName` — and `nitro.json`'s `autolinking` key must match it.
 * It must also be a `type` alias referencing `HybridView<…>` directly, not
 * indirected through another alias.
 *
 * The Props/Methods interface names above are never read by nitrogen (only
 * their members), which is why they can be prefixed `Native…` without
 * colliding with the public `LottieViewProps`.
 */
export type LottieView = HybridView<
  NativeLottieViewProps,
  NativeLottieViewMethods
>;
