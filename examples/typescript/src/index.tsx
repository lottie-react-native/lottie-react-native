import * as React from "react";
import { Animated, AppRegistry, StyleSheet, View } from "react-native";
import LottieView = require("lottie-react-native");

interface LottieAnimatedExampleState {
    animationProgress: Animated.Value;
    animation?: Animated.CompositeAnimation;
}

class LottieAnimatedExample extends React.Component<{}, LottieAnimatedExampleState> {
    constructor(props: any) {
        super(props);

        this.state = {
            animationProgress: new Animated.Value(0)
        };
    }

    componentDidMount() {
        const animation = Animated.loop(
            Animated.timing(this.state.animationProgress, { toValue: 1, duration: 2000 })
        );

        this.setState(
            { ...this.state, animation: animation },
            () => { animation.start() }
        );
    }

    componentWillUnmount() {
        if (this.state.animation !== undefined) {
            this.state.animation.stop();
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <LottieView source={require("./animations/LottieLogo1.json")} progress={this.state.animationProgress} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: { flex: 1 }
});

AppRegistry.registerComponent('example', () => LottieAnimatedExample);