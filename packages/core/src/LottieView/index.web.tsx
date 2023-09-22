import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { ViewProps } from 'react-native';
import type { LottieViewProps } from '../types';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { Player } from '@lottiefiles/react-lottie-player';
import { parsePossibleSources } from './utils';

type Props = LottieViewProps & { containerProps?: ViewProps };

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
      onAnimationFailure,
      onAnimationFinish,
      onAnimationLoop,
    }: Props,
    ref: any,
  ) => {
    const sources = parsePossibleSources(source);
    const isLottie =
      sources.sourceName?.includes('.lottie') || !!sources.sourceDotLottieURI;
    const lottieSource = sources.sourceDotLottieURI || sources.sourceName;

    const handleEvent = (event) => {
      if (event === 'error') {
        onAnimationFailure?.('error');
      }
      if (event === 'complete') {
        onAnimationFinish?.(false);
      }
      if (event === 'stop' || event === 'pause') {
        onAnimationFinish?.(true);
      }
      if (event === 'loop' || event === 'loopComplete') {
        onAnimationLoop?.();
      }
    };

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
