import LottieView from 'lottie-react-native';
import {View} from 'react-native';

const dotLottie = require('./animations/animation_lkekfrcl.lottie');
const jsonLottie = require('./animations/LottieLogo1.json');
const remoteLottie = {
  uri: 'https://raw.githubusercontent.com/lottie-react-native/lottie-react-native/master/apps/paper/src/animations/Watermelon.json',
};

export const DotLottieExample = () => {
  return (
    <LottieView
      sourceDotLottie={dotLottie}
      // source={jsonLottie}
      // source={remoteLottie}
      autoPlay={true}
      style={[{width: '100%', height: '100%', backgroundColor: 'grey'}]}
      loop={true}
      renderMode={'AUTOMATIC'}
      resizeMode={'contain'}
    />
  );
};
