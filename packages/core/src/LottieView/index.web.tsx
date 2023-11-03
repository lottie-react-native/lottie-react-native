import React, { forwardRef, useImperativeHandle, useRef, useCallback, useEffect } from 'react';
import type { LottieViewProps } from '../types';
import { parsePossibleSources } from './utils';

let DotLottiePlayer, Player;
try {
    DotLottiePlayer = require('@dotlottie/react-player').DotLottiePlayer;
} catch (e) { }
try {
    Player = require('@lottiefiles/react-lottie-player').Player;
} catch (e) { }

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
    const jsonSource = sources.sourceURL || sources.sourceJson;

    const [isError, setIsError] = React.useState(false);
    const [key, setKey] = React.useState(0);

    /**
     *  If an error occured reset the key when the source changes to force a re-render.
     */
    useEffect(() => {
      if (isError) {
        setKey((prevKey) => prevKey + 1);
        setIsError(false);
      }
    }, [source])

    if (progress != undefined && __DEV__) {
      console.warn('lottie-react-native: progress is not supported on web');
    }

    const handleEvent = useCallback((event) => {
      switch (event) {
        case 'error':
          onAnimationFailure?.('error');
          setIsError(true);
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
      if (!DotLottiePlayer) {
        throw new Error('lottie-react-native: The module @dotlottie/react-player is missing.');
      }
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

    if (!Player) {
      throw new Error('lottie-react-native: The module @lottiefiles/react-lottie-player is missing.');
    }
    return (
      <Player
        key={key}
        ref={playerRef}
        src={jsonSource}
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
