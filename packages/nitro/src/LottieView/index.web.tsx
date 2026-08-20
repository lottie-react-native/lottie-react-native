import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
  useState,
  Ref,
} from 'react';
import { parsePossibleSources } from './utils';
import { LottieViewProps } from '../types';
import { DotLottie, DotLottieReact } from '@lottiefiles/dotlottie-react';

const LottieView = forwardRef(
  (
    {
      source,
      speed,
      loop,
      webStyle,
      autoPlay,
      hover,
      direction,
      progress,
      onAnimationLoaded,
      onAnimationFailure,
      onAnimationFinish,
      onAnimationLoop,
    }: LottieViewProps,
    ref: Ref<{
      play: (s?: number, e?: number) => void;
      reset: () => void;
      pause: () => void;
      resume: () => void;
    }>,
  ) => {
    const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
    const sources = parsePossibleSources(source);
    const dotLottieRefCallback = useCallback((dotLottie: DotLottie) => {
      setDotLottie(dotLottie);
    }, []);

    useEffect(() => {
      if (dotLottie) {
        dotLottie.addEventListener('load', () => {
          onAnimationLoaded?.();
        });
        dotLottie.addEventListener('loadError', (e) => {
          onAnimationFailure?.(e.error.message);
        });
        dotLottie.addEventListener('complete', () => {
          onAnimationFinish?.(false);
        });
        dotLottie.addEventListener('stop', () => {
          onAnimationFinish?.(true);
        });
        dotLottie.addEventListener('pause', () => {
          onAnimationFinish?.(true);
        });
        dotLottie.addEventListener('loop', () => {
          onAnimationLoop?.();
        });

        return () => {
          dotLottie.removeEventListener('load');
          dotLottie.removeEventListener('loadError');
          dotLottie.removeEventListener('complete');
          dotLottie.removeEventListener('stop');
          dotLottie.removeEventListener('pause');
          dotLottie.removeEventListener('loop');
        };
      }
      return undefined;
    }, [
      dotLottie,
      onAnimationFailure,
      onAnimationFinish,
      onAnimationLoaded,
      onAnimationLoop,
    ]);

    useEffect(() => {
      if (progress != undefined && __DEV__) {
        console.warn('lottie-react-native: progress is not supported on web');
      }
    }, [progress]);

    useImperativeHandle(
      ref,
      () => {
        return {
          play: (s?: number, e?: number) => {
            if (!dotLottie) return;
            try {
              const bothDefined = s !== undefined && e !== undefined;
              const bothUndefined = s === undefined && e === undefined;
              const bothEqual = e === s;
              if (bothDefined) {
                if (bothEqual) {
                  dotLottie.setFrame(e);
                  dotLottie.play();
                  return;
                }
                dotLottie.setSegment(s, e);
                return;
              }
              if (s !== undefined && e === undefined) {
                dotLottie.setFrame(s);
                dotLottie.play();
              }
              if (bothUndefined) {
                dotLottie.play();
              }
            } catch (error) {
              console.error(error);
            }
          },
          reset: () => {
            dotLottie?.setFrame(0);
          },
          pause: () => {
            dotLottie?.pause();
          },
          resume: () => {
            dotLottie?.play();
          },
        };
      },
      [dotLottie],
    );

    if (!sources) {
      return null;
    }

    return (
      <DotLottieReact
        dotLottieRefCallback={dotLottieRefCallback}
        data={sources.sourceJson}
        src={
          sources.sourceDotLottieURI ?? sources.sourceURL ?? sources.sourceName
        }
        style={webStyle}
        autoplay={autoPlay}
        speed={speed}
        loop={loop}
        playOnHover={hover}
        mode={direction === -1 ? 'reverse' : 'forward'}
      />
    );
  },
);

export { LottieView };
