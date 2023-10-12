import React, { forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import type { LottieViewProps } from '../types';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { Player } from '@lottiefiles/react-lottie-player';
import { parsePossibleSources } from './utils';

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
      onAnimationFailure,
      onAnimationFinish,
      onAnimationLoop,
    }: LottieViewProps,
    ref: any,
  ) => {
    const sources = parsePossibleSources(source);
    const isLottie =
      sources.sourceName?.includes('.lottie') || !!sources.sourceDotLottieURI;
    const lottieSource = sources.sourceDotLottieURI || sources.sourceName;

    if (progress != undefined && __DEV__) {
      console.warn('lottie-react-native: progress is not supported on web');
    }

    const handleEvent = useCallback((event) => {
      switch (event) {
        case 'error':
          onAnimationFailure?.('error');
          break;

        case 'complete':
          onAnimationFinish?.(false);
          break;

        case 'stop':
        case 'pause':
          onAnimationFinish?.(true);
          break;

        case 'loop':
        case 'loopComplete':
          onAnimationLoop?.();
          break;
      }
    }, []);

    const playerRef = useRef(null);

    useImperativeHandle(ref, () => ({
      play: () => {
        playerRef.current?.play();
      },
      reset: () => {
        if (isLottie) {
          playerRef.current?.stop();
        } else {
          playerRef.current?.setSeeker(0, false);
        }
      },
      pause: () => {
        playerRef.current?.pause();
      },
      resume: () => {
        playerRef.current?.play();
      },
    }));

    if (isLottie) {
      return (
        <DotLottiePlayer
          lottieRef={playerRef}
          src={lottieSource}
          onEvent={handleEvent}
          style={webStyle}
          autoplay={autoPlay}
          speed={speed}
          loop={loop}
          hover={hover}
          direction={direction}
        />
      );
    }
    return (
      <Player
        ref={playerRef}
        src={source}
        onEvent={handleEvent}
        style={webStyle}
        autoplay={autoPlay}
        speed={speed}
        loop={loop}
        hover={hover}
        direction={direction}
      />
    );
  },
);

export { LottieView };
