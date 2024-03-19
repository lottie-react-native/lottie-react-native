import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { parsePossibleSources } from "./utils";
import { LottieViewProps } from "lottie-react-native";
import {
  DotLottieCommonPlayer,
  DotLottiePlayer,
  PlayerEvents,
} from "@dotlottie/react-player";

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
    ref: any
  ) => {
    const sources = parsePossibleSources(source);
    const lottieSource = sources?.sourceDotLottieURI || sources?.sourceName;
    const jsonSource = sources?.sourceURL || sources?.sourceJson;

    const [isError, setIsError] = React.useState(false);
    const [isReady, setIsReady] = React.useState(false);
    const [key, setKey] = React.useState(0);

    const playerRef = useRef<DotLottieCommonPlayer | null>(null);
    /**
     *  If an error occured reset the key when the source changes to force a re-render.
     */
    useEffect(() => {
      if (isError) {
        setKey((prevKey) => prevKey + 1);
        setIsError(false);
      }
    }, [source]);

    if (progress != undefined && __DEV__) {
      console.warn("lottie-react-native: progress is not supported on web");
    }

    const runAfterReady = useCallback(
      (fn: () => void) => {
        if (!isReady) {
          const container = playerRef.current?.container;
          const listener = () => {
            fn();
            container?.removeEventListener("is_ready", listener);
          };
          container?.addEventListener("is_ready", listener);
        } else {
          fn();
        }
      },
      [isReady]
    );

    const handleEvent = useCallback(
      (event: PlayerEvents) => {
        switch (event) {
          case "ready":
            if (isReady) return;
            const container = playerRef.current?.container;
            setIsReady(true);
            container?.dispatchEvent(new Event("is_ready"));
            break;
          case "error":
            onAnimationFailure?.("error");
            setIsError(true);
            break;

          case "complete":
            onAnimationFinish?.(false);
            //prevent reseting animation if not looping, for consistency with native
            autoPlay && !loop && playerRef.current?.stop();
            break;

          case "stop":
          case "pause":
            onAnimationFinish?.(true);
            break;

          //case "loop":
          case "loopComplete":
            onAnimationLoop?.();
            break;
        }
      },
      [isReady]
    );

    useImperativeHandle(
      ref,
      () => {
        return {
          play: (s?: number, e?: number) => {
            const player = playerRef.current;
            if (!player) return;
            runAfterReady(() => {
              try {
                const bothDefined = s !== undefined && e !== undefined;
                const bothUndefined = s === undefined && e === undefined;
                const bothEqual = e === s;
                if (bothDefined) {
                  if (bothEqual) {
                    player.goToAndStop(e, true);
                    return;
                  }
                  player.playSegments([s, e], true);
                  return;
                }
                if (s !== undefined && e === undefined) {
                  player.goToAndPlay(s, true);
                }
                if (bothUndefined) {
                  player.play();
                }
              } catch (error) {
                console.error(error);
              }
            });
          },
          reset: () => {
            runAfterReady(() => {
              playerRef.current?.goToAndStop(0, false);
            });
          },
          pause: () => {
            runAfterReady(() => {
              playerRef.current?.pause();
            });
          },
          resume: () => {
            runAfterReady(() => {
              playerRef.current?.play();
            });
          },
        };
      },
      [isReady]
    );

    return (
      <DotLottiePlayer
        key={key}
        ref={playerRef}
        src={(lottieSource || jsonSource) as string}
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
);

export { LottieView };
