import {useState, useRef, useEffect} from 'react';
import {View, Text, StatusBar} from 'react-native';
import LottieView from 'lottie-react-native';
import {EXAMPLES} from './constants';

StatusBar.setHidden(true);

const lottieImage = EXAMPLES[0].getSource();
const RE_RENDER_LIMIT = 50;
const INTERVAL_LIMIT = 1500;
const LOTTIE_VIEW_COUNT = 12;

export function MemoryTest() {
  const [show, setShow] = useState(false);
  const renderCountRef = useRef(0);

  useEffect(() => {
    const lastIntervalRef = setInterval(() => {
      if (renderCountRef.current >= RE_RENDER_LIMIT) {
        setShow(false);
        clearInterval(lastIntervalRef);
      } else {
        renderCountRef.current++;
        setShow(p => !p);
      }
    }, INTERVAL_LIMIT);
  }, []);

  if (renderCountRef.current >= RE_RENDER_LIMIT)
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text>Done...</Text>
      </View>
    );

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      {show ? (
        Array.from({length: LOTTIE_VIEW_COUNT}).map((p, idx) => {
          return (
            <LottieView
              source={lottieImage}
              style={{height: 40, width: 40}}
              key={idx}
              autoPlay
              renderMode="HARDWARE"
            />
          );
        })
      ) : (
        <Text>Re-rendering...</Text>
      )}
    </View>
  );
}
