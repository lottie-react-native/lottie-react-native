import { Image } from 'react-native';

function parsePossibleSources(source):
  | {
      sourceURL?: string;
      sourceJson?: string;
      sourceName?: string;
      sourceDotLottieURI?: string;
    }
  | undefined {
  if (typeof source === 'string') {
    return { sourceName: source };
  }

  if (typeof source === 'object' && !(source as any).uri) {
    return { sourceJson: JSON.stringify(source) };
  }

  if (typeof source === 'object' && (source as any).uri) {
    // uri contains .lottie extension return sourceDotLottieURI
    if ((source as any).uri.includes('.lottie')) {
      return { sourceDotLottieURI: (source as any).uri };
    }

    return { sourceURL: (source as any).uri };
  }

  if (typeof source === 'number') {
    return { sourceDotLottieURI: Image.resolveAssetSource(source).uri };
  }

  return undefined;
}

export { parsePossibleSources };
