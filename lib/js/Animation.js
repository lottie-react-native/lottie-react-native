import React from 'react';
import LottieView from './LottieView';

class LottieAnimation extends React.Component {
  componentDidMount() {
    console.warn(
      '<Animation> is deprecated. Please switch to <LottieView> which is a drop in replacement.',
    );
  }

  render() {
    return <LottieView {...this.props} />;
  }
}

LottieAnimation.propTypes = LottieView.propTypes;
LottieAnimation.defaultProps = LottieView.defaultProps;
module.exports = LottieAnimation;
