import * as React from 'react';
import { View, type ViewProps } from 'react-native';

/**
 * Web no-op.
 *
 * `react-native-nitro-modules` deep-imports
 * `react-native/Libraries/NativeComponent/NativeComponentRegistry`, which is
 * Flow source that react-native-web cannot alias and webpack will not
 * transform. So the web build must never reach the native entry point — this
 * file is what it resolves to instead.
 *
 * Resolution depends on `package.json`'s `react-native` field staying
 * extensionless, so webpack picks `.web.tsx` first.
 */
export const LottieView = (props: ViewProps) => <View {...props} />;

export type { LottieViewMethods, LottieViewProps } from './LottieView.nitro';
