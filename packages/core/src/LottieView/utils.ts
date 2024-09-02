import { Image } from 'react-native';

function looksLikeDotLottieURI(uri: string): boolean {
  try {
    const parsedURL = new URL(uri);
    return parsedURL.pathname.endsWith('.lottie');
  } catch (e) {
    // Failed to parse URL, assume it's an ordinary JSON
    return false;
  }
}

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
    if (looksLikeDotLottieURI(uri)) {
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
