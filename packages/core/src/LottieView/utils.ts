import { Image } from 'react-native';

function parsePossibleSources(source):
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

export { parsePossibleSources };
