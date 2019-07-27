/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    Animated,
    Image,
    ScrollView,
    View,
    Text,
    PanResponder,
    Dimensions
} from 'react-native';
import api from './api';

const { height, width } = Dimensions.get('window');
export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            photos: undefined,
            curentIndex: 0
        }
        this.position = new Animated.ValueXY();
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onPanResponderMove: (evt, gestureState) => {
                this.position.setValue({ x: gestureState.dx, y: gestureState.dy });
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dx > 120) {
                    Animated.spring(
                        this.position, {
                            toValue: { x: width + 100, y: gestureState.dy }
                        }
                    ).start(() => {
                        this.setState({ curentIndex: this.state.curentIndex + 1 }, () => {
                            this.position.setValue({ x: 0, y: 0 })
                        })
                    })
                } else if (gestureState.dx < -120) {
                    Animated.spring(
                        this.position, {
                            toValue: { x: -width + 100, y: gestureState.dy }
                        }
                    ).start(() => {
                        this.setState({ curentIndex: this.state.curentIndex + 1 }, () => {
                            this.position.setValue({ x: 0, y: 0 })
                        })
                    })
                } else {
                    Animated.spring(this.position, {
                        toValue: { x: 0, y: 0 },
                        friction: 4
                    }).start()
                }
            },
        });
        this.rotate = this.position.x.interpolate({
            inputRange: [-width / 2, 0, width / 2],
            outputRange: ['-10deg', '0deg', '10deg'],
            extrapolate: "clamp"
        });
        this.rotateAndTranslate = {
            transform: [{
                rotate: this.rotate
            },
            ...this.position.getTranslateTransform()
            ]
        };
        this.likeOpacity = this.position.x.interpolate({
            inputRange: [-width / 2, 0, width / 2],
            outputRange: [0, 0, 1],
            extrapolate: "clamp"
        });
        this.dislikeOpacity = this.position.x.interpolate({
            inputRange: [-width / 2, 0, width / 2],
            outputRange: [1, 0, 0],
            extrapolate: "clamp"
        });
        this.nextCardOpacity = this.position.x.interpolate({
            inputRange: [-width / 2, 0, width / 2],
            outputRange: [1, 0, 1],
            extrapolate: "clamp"
        });
        this.nextCardScale = this.position.x.interpolate({
            inputRange: [-width / 2, 0, width / 2],
            outputRange: [1, 0.8, 1],
            extrapolate: "clamp"
        });
    }
    componentDidMount() {
        api.getPhoto()
            .then(
                data => {
                    this.setState({ photos: data.data });
                }
            )
            .catch(
                err => {
                    console.log('====================================')
                    console.log(err.response.data)
                    console.log('====================================')
                }
            )
    }

    renderImage = () => {
        if (this.state.photos !== undefined) {
            return this.state.photos.map(
                (ImageData, i) => {
                    if (i < this.state.curentIndex) {
                        return null
                    } else if (i === this.state.curentIndex) {
                        return (
                            <Animated.View
                                {...this.panResponder.panHandlers}
                                key={ImageData.id}
                                style={[this.rotateAndTranslate, { height: height - 120, width: width, padding: 10, position: "absolute" }]}
                            >
                                <Animated.View style={{ opacity: this.likeOpacity, transform: [{ rotate: '-30deg' }], position: 'absolute', top: 50, left: 40, zIndex: 1000 }}>
                                    <Text style={{ borderWidth: 1, borderColor: "green", color: "green", fontSize: 32, fontWeight: '800', padding: 10 }}>LIKE</Text>
                                </Animated.View>
                                <Animated.View style={{ opacity: this.dislikeOpacity, transform: [{ rotate: '30deg' }], position: 'absolute', top: 50, right: 40, zIndex: 1000 }}>
                                    <Text style={{ borderWidth: 1, borderColor: "red", color: "red", fontSize: 32, fontWeight: '800', padding: 10 }}>NOPE</Text>
                                </Animated.View>
                                <Image
                                    source={{ uri: ImageData.urls.regular }}
                                    style={{ flex: 1, height: null, width: null, resizeMode: 'cover', borderRadius: 20 }}
                                />
                            </Animated.View>
                        )
                    } else {
                        return (
                            <Animated.View

                                key={ImageData.id}
                                style={[{ opacity: this.nextCardOpacity, transform: [{ scale: this.nextCardScale }], height: height - 120, width: width, padding: 10, position: "absolute" }]}
                            >
                                <Image
                                    source={{ uri: ImageData.urls.regular }}
                                    style={{ flex: 1, height: null, width: null, resizeMode: 'cover', borderRadius: 20 }}
                                />
                            </Animated.View>
                        )
                    }

                }
            ).reverse()

        }

    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ height: 60 }}></View>
                <View style={{ flex: 1 }}>
                    {this.renderImage()}
                </View>
                <View style={{ height: 60 }}></View>
            </View >
        )
    }
}