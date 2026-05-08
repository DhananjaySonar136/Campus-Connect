import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

type AnimatedSplashScreenProps = {
  isReady: boolean;
  onFinish: () => void;
};

const splashDurationMs = 1800;

export function AnimatedSplashScreen({ isReady, onFinish }: AnimatedSplashScreenProps) {
  const [minimumTimeDone, setMinimumTimeDone] = useState(false);
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(0.82)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.7)).current;
  const ringOpacity = useRef(new Animated.Value(0.36)).current;
  const dotOne = useRef(new Animated.Value(0)).current;
  const dotTwo = useRef(new Animated.Value(0)).current;
  const dotThree = useRef(new Animated.Value(0)).current;
  const hasFinished = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinimumTimeDone(true), splashDurationMs);

    Animated.parallel([
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 7,
        tension: 70,
        useNativeDriver: true
      })
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1.16,
            duration: 1100,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 1100,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true
          })
        ]),
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 0.7,
            duration: 0,
            useNativeDriver: true
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.36,
            duration: 0,
            useNativeDriver: true
          })
        ])
      ])
    ).start();

    Animated.loop(
      Animated.stagger(
        140,
        [dotOne, dotTwo, dotThree].map((dot) =>
          Animated.sequence([
            Animated.timing(dot, {
              toValue: -8,
              duration: 360,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 360,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true
            })
          ])
        )
      )
    ).start();

    return () => clearTimeout(timer);
  }, [dotOne, dotThree, dotTwo, iconOpacity, iconScale, ringOpacity, ringScale]);

  useEffect(() => {
    if (!isReady || !minimumTimeDone || hasFinished.current) {
      return;
    }

    hasFinished.current = true;
    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start(onFinish);
  }, [containerOpacity, isReady, minimumTimeDone, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <View style={styles.glow} />
      <Animated.View
        style={[
          styles.ring,
          {
            opacity: ringOpacity,
            transform: [{ scale: ringScale }]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.iconFrame,
          {
            opacity: iconOpacity,
            transform: [{ scale: iconScale }]
          }
        ]}
      >
        <Image
          accessibilityIgnoresInvertColors
          source={require('../../assets/icon.png')}
          style={styles.icon}
        />
      </Animated.View>
      <Text style={styles.title}>Campus Connect</Text>
      <View style={styles.dots}>
        {[dotOne, dotTwo, dotThree].map((dot, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                transform: [{ translateY: dot }]
              }
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#030a34',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden'
  },
  dot: {
    backgroundColor: '#31e7f5',
    borderRadius: 5,
    height: 10,
    marginHorizontal: 5,
    width: 10
  },
  dots: {
    flexDirection: 'row',
    height: 24,
    marginTop: 28
  },
  glow: {
    backgroundColor: '#7c3aed',
    borderRadius: 240,
    height: 480,
    opacity: 0.18,
    position: 'absolute',
    right: -170,
    top: 80,
    width: 480
  },
  icon: {
    borderRadius: 38,
    height: 164,
    width: 164
  },
  iconFrame: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 52,
    elevation: 18,
    height: 184,
    justifyContent: 'center',
    shadowColor: '#31e7f5',
    shadowOffset: { height: 16, width: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    width: 184
  },
  ring: {
    borderColor: '#31e7f5',
    borderRadius: 140,
    borderWidth: 2,
    height: 280,
    position: 'absolute',
    width: 280
  },
  title: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 34
  }
});
