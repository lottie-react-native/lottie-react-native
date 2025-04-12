import { Image } from 'react-native';
import Color from 'color';
import type { LottieViewProps } from 'lottie-react-native';
import type { NativeProps } from '../specs/LottieReactNative.nitro';

function parsePossibleSources(source: any):
  | {
      sourceURL?: string;
      sourceJson?: string;
      sourceName?: string;
      sourceDotLottieURI?: string;
    }
  | undefined {
  const uri = (source as any).uri;

  if (typeof source === 'string') {
    return { sourceName: source };
  }

  if (typeof source === 'object' && !uri) {
    return { sourceJson: JSON.stringify(source) };
  }

  if (typeof source === 'object' && uri) {
    // uri contains .lottie extension return sourceDotLottieURI
    if (uri.includes('.lottie')) {
      return { sourceDotLottieURI: uri };
    }

    return { sourceURL: uri };
  }

  if (typeof source === 'number') {
    return { sourceDotLottieURI: Image.resolveAssetSource(source).uri };
  }

  return undefined;
}

function parseColorToHex(source: string): string {
  return Color(source).hex();
}

function parseResizeModeToInternal(
  resizeMode: LottieViewProps['resizeMode']
): NativeProps['resizeMode'] {
  return (() => {
    switch (resizeMode) {
      case 'center':
        return 'center';
      case 'cover':
        return 'cover';
      case 'contain':
        return 'contain';
      case undefined:
        return 'NOT_SET';
    }
  })();
}

function parseRenderModeToInternal(
  renderMode: LottieViewProps['renderMode']
): NativeProps['renderMode'] {
  return (() => {
    switch (renderMode) {
      case 'AUTOMATIC':
        return 'AUTOMATIC';
      case 'SOFTWARE':
        return 'SOFTWARE';
      case 'HARDWARE':
        return 'HARDWARE';
      case undefined:
        return 'NOT_SET';
    }
  })();
}

export {
  parsePossibleSources,
  parseColorToHex,
  parseResizeModeToInternal,
  parseRenderModeToInternal,
};
