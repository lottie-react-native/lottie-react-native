import React, { forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import type { LottieViewProps } from '../types';
import { parsePossibleSources } from './utils';

let DotLottiePlayer, Player;
try {
    DotLottiePlayer = require('@dotlottie/react-player').DotLottiePlayer;
    Player = require('@lottiefiles/react-lottie-player').Player;
} catch (e) {
    console.warn('lottie-react-native: The module @dotlottie/react-player or @lottiefiles/react-lottie-player is missing. Please install it for the app to function correctly.');
}

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
