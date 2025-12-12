import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing, Text } from 'react-native';

interface HippoRamenProps {
  size?: number;
}

export default function HippoRamen({ size = 200 }: HippoRamenProps) {
  const scale = size / 200;

  // Animations
  const hippoFloat = useRef(new Animated.Value(0)).current;
  const hippoRotate = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const mouthAnim = useRef(new Animated.Value(0)).current;
  const earWiggle = useRef(new Animated.Value(0)).current;
  const steam1 = useRef(new Animated.Value(0)).current;
  const steam2 = useRef(new Animated.Value(0)).current;
  const steam3 = useRef(new Animated.Value(0)).current;
  const cheekPuff = useRef(new Animated.Value(1)).current;

  // Hippo floating in bowl
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(hippoFloat, {
          toValue: -5,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(hippoFloat, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Gentle sway
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(hippoRotate, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(hippoRotate, {
          toValue: -1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Blinking
  useEffect(() => {
    const blink = () => {
      Animated.sequence([
        Animated.delay(2500 + Math.random() * 2000),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
      ]).start(() => blink());
    };
    blink();
  }, []);

  // Occasional happy munch
  useEffect(() => {
    const munch = () => {
      Animated.sequence([
        Animated.delay(3000 + Math.random() * 3000),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(mouthAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.timing(mouthAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(mouthAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.timing(mouthAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(cheekPuff, { toValue: 1.2, duration: 300, useNativeDriver: true }),
            Animated.timing(cheekPuff, { toValue: 1, duration: 300, useNativeDriver: true }),
          ]),
        ]),
      ]).start(() => munch());
    };
    munch();
  }, []);

  // Ear wiggle
  useEffect(() => {
    const wiggle = () => {
      Animated.sequence([
        Animated.delay(4000 + Math.random() * 3000),
        Animated.timing(earWiggle, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(earWiggle, {
          toValue: 0,
          duration: 150,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]).start(() => wiggle());
    };
    wiggle();
  }, []);

  // Steam animations
  useEffect(() => {
    const animateSteam = (steamAnim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(steamAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(steamAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    animateSteam(steam1, 0);
    animateSteam(steam2, 700);
    animateSteam(steam3, 1400);
  }, []);

  // Interpolations
  const rotation = hippoRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-4deg', '4deg'],
  });

  const eyeScaleY = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 1],
  });

  const earRotation = earWiggle.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-20deg'],
  });

  const steamOpacity = (anim: Animated.Value) => anim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.8, 0],
  });

  const steamTranslateY = (anim: Animated.Value) => anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  const mouthScale = mouthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={[styles.container, { transform: [{ scale }] }]}>
      {/* Steam - behind everything */}
      <View style={styles.steamContainer}>
        <Animated.Text
          style={[
            styles.steam,
            {
              opacity: steamOpacity(steam1),
              transform: [{ translateY: steamTranslateY(steam1) }],
            },
          ]}
        >
          ~
        </Animated.Text>
        <Animated.Text
          style={[
            styles.steam,
            {
              opacity: steamOpacity(steam2),
              transform: [{ translateY: steamTranslateY(steam2) }],
            },
          ]}
        >
          ~
        </Animated.Text>
        <Animated.Text
          style={[
            styles.steam,
            {
              opacity: steamOpacity(steam3),
              transform: [{ translateY: steamTranslateY(steam3) }],
            },
          ]}
        >
          ~
        </Animated.Text>
      </View>

      {/* Main scene container */}
      <View style={styles.scene}>
        {/* Hippo - positioned to sit in bowl */}
        <Animated.View
          style={[
            styles.hippo,
            {
              transform: [
                { translateY: hippoFloat },
                { rotate: rotation },
              ],
            },
          ]}
        >
          {/* Ears */}
          <Animated.View style={[styles.ear, styles.earLeft, { transform: [{ rotate: earRotation }] }]}>
            <View style={styles.earInner} />
          </Animated.View>
          <View style={[styles.ear, styles.earRight]}>
            <View style={styles.earInner} />
          </View>

          {/* Head */}
          <View style={styles.head}>
            {/* Eyes */}
            <View style={styles.eyes}>
              <View style={styles.eyeWhite}>
                <Animated.View style={[styles.eyeBall, { transform: [{ scaleY: eyeScaleY }] }]}>
                  <View style={styles.pupil}>
                    <View style={styles.highlight} />
                  </View>
                </Animated.View>
              </View>
              <View style={styles.eyeWhite}>
                <Animated.View style={[styles.eyeBall, { transform: [{ scaleY: eyeScaleY }] }]}>
                  <View style={styles.pupil}>
                    <View style={styles.highlight} />
                  </View>
                </Animated.View>
              </View>
            </View>

            {/* Blush */}
            <Animated.View style={[styles.blush, styles.blushLeft, { transform: [{ scale: cheekPuff }] }]} />
            <Animated.View style={[styles.blush, styles.blushRight, { transform: [{ scale: cheekPuff }] }]} />

            {/* Snout */}
            <View style={styles.snout}>
              <View style={styles.nostril} />
              <View style={styles.nostril} />
            </View>

            {/* Mouth - toggles between smile and open */}
            <Animated.View
              style={[
                styles.mouthOpen,
                {
                  transform: [{ scaleY: mouthScale }],
                  opacity: mouthAnim,
                }
              ]}
            />
            <Animated.View
              style={[
                styles.smile,
                {
                  opacity: mouthAnim.interpolate({
                    inputRange: [0, 0.5],
                    outputRange: [1, 0],
                    extrapolate: 'clamp',
                  })
                }
              ]}
            />
          </View>

          {/* Arms - visible over bowl edge */}
          <View style={styles.arms}>
            <View style={[styles.arm, styles.armLeft]} />
            <View style={[styles.arm, styles.armRight]} />
          </View>
        </Animated.View>

        {/* Bowl */}
        <View style={styles.bowl}>
          {/* Bowl rim (top edge) */}
          <View style={styles.bowlRim} />

          {/* Bowl body */}
          <View style={styles.bowlBody}>
            {/* White stripe */}
            <View style={styles.bowlStripe} />

            {/* Broth visible at top */}
            <View style={styles.broth}>
              {/* Toppings */}
              <View style={styles.toppings}>
                {/* Chashu */}
                <View style={styles.chashu}>
                  <View style={styles.chashuStripe} />
                  <View style={[styles.chashuStripe, { top: 12 }]} />
                </View>

                {/* Noodles */}
                <View style={styles.noodles}>
                  <View style={styles.noodle} />
                  <View style={[styles.noodle, { left: 6, height: 28 }]} />
                  <View style={[styles.noodle, { left: 12, height: 22 }]} />
                  <View style={[styles.noodle, { left: 18, height: 26 }]} />
                  <View style={[styles.noodle, { left: 24, height: 20 }]} />
                </View>

                {/* Egg */}
                <View style={styles.egg}>
                  <View style={styles.yolk} />
                </View>

                {/* Narutomaki */}
                <View style={styles.naruto}>
                  <View style={styles.narutoSpiral} />
                </View>

                {/* Green onions */}
                <View style={[styles.greenOnion, { left: 30, top: 5 }]} />
                <View style={[styles.greenOnion, { left: 70, top: 8 }]} />
                <View style={[styles.greenOnion, { left: 50, top: 20 }]} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scene: {
    width: 180,
    height: 160,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  // Steam
  steamContainer: {
    position: 'absolute',
    top: 15,
    flexDirection: 'row',
    gap: 15,
    zIndex: 1,
  },
  steam: {
    fontSize: 20,
    color: '#ccc',
    fontWeight: '300',
  },

  // Hippo
  hippo: {
    position: 'absolute',
    top: 25,
    zIndex: 10,
    alignItems: 'center',
  },
  ear: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 20,
    backgroundColor: '#8B7B6B',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  earLeft: {
    left: -5,
  },
  earRight: {
    right: -5,
  },
  earInner: {
    width: 12,
    height: 12,
    backgroundColor: '#A89888',
    borderRadius: 6,
  },
  head: {
    width: 75,
    height: 60,
    backgroundColor: '#9C8B7A',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eyes: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 2,
  },
  eyeWhite: {
    width: 18,
    height: 18,
    backgroundColor: '#fff',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeBall: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pupil: {
    width: 10,
    height: 10,
    backgroundColor: '#2d3436',
    borderRadius: 5,
  },
  highlight: {
    width: 4,
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginLeft: 2,
    marginTop: 1,
  },
  blush: {
    position: 'absolute',
    width: 14,
    height: 8,
    backgroundColor: 'rgba(255, 150, 170, 0.6)',
    borderRadius: 7,
    top: 28,
  },
  blushLeft: {
    left: 6,
  },
  blushRight: {
    right: 6,
  },
  snout: {
    width: 38,
    height: 20,
    backgroundColor: '#B8A99A',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  nostril: {
    width: 6,
    height: 8,
    backgroundColor: '#6D5D4E',
    borderRadius: 3,
  },
  mouthOpen: {
    width: 14,
    height: 8,
    backgroundColor: '#E57373',
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    marginTop: 2,
  },
  smile: {
    position: 'absolute',
    bottom: 6,
    width: 12,
    height: 6,
    borderBottomWidth: 2.5,
    borderBottomColor: '#6D5D4E',
    borderRadius: 6,
  },
  arms: {
    flexDirection: 'row',
    gap: 50,
    marginTop: -6,
  },
  arm: {
    width: 22,
    height: 16,
    backgroundColor: '#9C8B7A',
    borderRadius: 8,
  },
  armLeft: {
    transform: [{ rotate: '25deg' }],
  },
  armRight: {
    transform: [{ rotate: '-25deg' }],
  },

  // Bowl
  bowl: {
    alignItems: 'center',
  },
  bowlRim: {
    width: 170,
    height: 14,
    backgroundColor: '#E53935',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: '#C62828',
    zIndex: 5,
  },
  bowlBody: {
    width: 160,
    height: 70,
    backgroundColor: '#E53935',
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    borderWidth: 3,
    borderTopWidth: 0,
    borderColor: '#C62828',
    overflow: 'hidden',
    alignItems: 'center',
  },
  bowlStripe: {
    position: 'absolute',
    top: 20,
    width: 140,
    height: 14,
    backgroundColor: '#FFCDD2',
    borderRadius: 7,
  },
  broth: {
    position: 'absolute',
    top: 0,
    width: 150,
    height: 55,
    backgroundColor: '#FFCC80',
    borderBottomLeftRadius: 75,
    borderBottomRightRadius: 75,
  },
  toppings: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },

  // Chashu
  chashu: {
    position: 'absolute',
    left: 8,
    top: 10,
    width: 35,
    height: 28,
    backgroundColor: '#A1887F',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#8D6E63',
  },
  chashuStripe: {
    position: 'absolute',
    top: 5,
    left: 4,
    width: 22,
    height: 4,
    backgroundColor: '#FFCCBC',
    borderRadius: 2,
  },

  // Noodles
  noodles: {
    position: 'absolute',
    left: 55,
    top: 15,
    flexDirection: 'row',
  },
  noodle: {
    width: 4,
    height: 25,
    backgroundColor: '#FFF59D',
    borderRadius: 2,
    position: 'absolute',
  },

  // Egg
  egg: {
    position: 'absolute',
    right: 10,
    top: 5,
    width: 30,
    height: 22,
    backgroundColor: '#FFF',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  yolk: {
    width: 14,
    height: 14,
    backgroundColor: '#FF9800',
    borderRadius: 7,
  },

  // Narutomaki
  naruto: {
    position: 'absolute',
    right: 35,
    top: 30,
    width: 24,
    height: 24,
    backgroundColor: '#FFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCE4EC',
  },
  narutoSpiral: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#F48FB1',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },

  // Green onion
  greenOnion: {
    position: 'absolute',
    width: 7,
    height: 7,
    backgroundColor: '#81C784',
    borderRadius: 4,
  },
});
