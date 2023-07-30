import LottieView from 'lottie-react-native';
import {View} from 'react-native';

const dotLottie = require('./animations/animation_lkekfrcl.lottie');
const jsonLottie = require('./animations/LottieWalkthrough.json');
const remoteLottie = {
  uri: 'https://raw.githubusercontent.com/lottie-react-native/lottie-react-native/master/apps/paper/src/animations/Watermelon.json',
};

export const DotLottieExample = () => {
  return (
    <View style={{justifyContent: 'center', flex: 1, alignItems: 'center'}}>
      <LottieView
        sourceDotLottie={dotLottie}
        // source={jsonLottie}
        // source={remoteLottie}
        autoPlay={true}
        style={[{width: '50%', height: '20%', backgroundColor: 'red'}]}
        loop={true}
        renderMode={'AUTOMATIC'}
        resizeMode={'contain'}
      />
    </View>
  );
};
