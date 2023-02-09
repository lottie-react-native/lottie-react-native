import Slider from '@react-native-community/slider';
import LottieView from 'lottie-react-native';
import {AnimatedLottieViewProps} from 'lottie-react-native/lib/typescript/LottieView.types';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Button,
  Image,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ExamplePicker} from './ExamplePicker';
import RenderModePicker from './RenderModePicker';
import {
  EXAMPLES,
  inverseIcon,
  loopIcon,
  pauseIcon,
  playIcon,
  styles,
} from './constants';

const AnimatedSlider = Animated.createAnimatedComponent(Slider);

const LottieAnimatedExample = () => {
  const [example, setExample] = useState(EXAMPLES[0]);
  const [duration, setDuration] = useState(3000);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isInverse, setIsInverse] = useState(false);
  const [loop, setLoop] = useState(true);
  const [renderMode, setRenderMode] =
    useState<AnimatedLottieViewProps['renderMode']>('AUTOMATIC');
  const [isImperative, setImperative] = useState(false);
  const anim = useRef<LottieView>(null);

  const [progress] = useState(new Animated.Value(0));

  const onAnimationFinish = () => {
    console.log('Animation finished');
  };

  const onPlayPress = () => {
    if (isPlaying) {
      anim.current?.pause();
    } else {
      anim.current?.play();
    }
    setIsPlaying(p => !p);
  };

  const onLoopPress = () => setLoop(p => !p);
  const onInversePress = () => setIsInverse(p => !p);
  const onToggleImperative = () => setImperative(p => !p);

  const startImperative = () => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start(() => {
      setIsPlaying(false);
      progress.setValue(0);
    });
  };

  useEffect(() => {
    if (isImperative) {
      anim.current?.play();
      startImperative();
    } else {
      anim.current?.play();
      setIsPlaying(true);
    }
  }, [isImperative]);

  return (
    <View style={{flex: 1}}>
      <ExamplePicker
        example={example}
        examples={EXAMPLES}
        onChange={setExample}
      />
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <LottieView
          ref={anim}
          autoPlay={isImperative ? false : isPlaying}
          style={[{width: example.width}, isInverse && styles.lottieViewInvse]}
          source={example.getSource()}
          progress={isImperative ? progress : undefined}
          loop={isImperative ? false : loop}
          onAnimationFinish={onAnimationFinish}
          enableMergePathsAndroidForKitKatAndAbove
          renderMode={renderMode}
        />
      </View>
      <View style={{paddingBottom: 20, paddingHorizontal: 10}}>
        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={onLoopPress} disabled={isImperative}>
            <Image
              style={[
                styles.controlsIcon,
                loop && styles.controlsIconEnabled,
                isImperative && styles.controlsIconDisabled,
              ]}
              resizeMode="contain"
              source={loopIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.playButton}
            onPress={onPlayPress}
            disabled={isImperative}>
            <Image
              style={[
                styles.playButtonIcon,
                isImperative && styles.controlsIconDisabled,
              ]}
              resizeMode="contain"
              source={isPlaying ? pauseIcon : playIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onInversePress}>
            <Image
              style={styles.controlsIcon}
              resizeMode="contain"
              source={inverseIcon}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingBottom: 10,
          }}>
          <Text>Use Imperative API:</Text>
          <View />
          <Switch onValueChange={onToggleImperative} value={isImperative} />
        </View>
        <View>
          <View>
            <Text>Render Mode:</Text>
          </View>
        </View>
        <View>
          <View>
            <Text>Duration: ({Math.round(duration)}ms)</Text>
          </View>
          <Slider
            style={{height: 30}}
            step={50}
            minimumValue={50}
            maximumValue={6000}
            value={duration}
            onValueChange={setDuration}
            disabled={!isImperative}
          />
          <Button
            disabled={isImperative ? isPlaying : true}
            title={'Restart'}
            onPress={() => {
              startImperative();
            }}
          />
        </View>
        <RenderModePicker renderMode={renderMode} onChange={setRenderMode} />
      </View>
    </View>
  );
};

export default LottieAnimatedExample;
