import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing, Text } from 'react-native';

type HippoMode =
  | 'peeking' | 'sleeping' | 'cooking' | 'munching' | 'stirring' | 'chopping' | 'waiting'
  | 'tasting' | 'flipping' | 'washing' | 'cheering' | 'seasoning' | 'plating' | 'running';

export type { HippoMode };

interface HippoProps {
  mode: HippoMode;
  size?: number;
  carryingFood?: string; // emoji of food being carried
}

export default function Hippo({ mode, size = 80, carryingFood }: HippoProps) {
  const scale = size / 80;

  // Core animations
  const peekAnim = useRef(new Animated.Value(100)).current;
  const bodyBob = useRef(new Animated.Value(0)).current;
  const bodyRotate = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(1)).current;

  // Face animations
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const mouthAnim = useRef(new Animated.Value(0)).current;
  const cheekPuff = useRef(new Animated.Value(1)).current;

  // Ear animations
  const leftEarRotate = useRef(new Animated.Value(0)).current;
  const rightEarRotate = useRef(new Animated.Value(0)).current;

  // Arm/cooking animations
  const armRotate = useRef(new Animated.Value(0)).current;
  const armY = useRef(new Animated.Value(0)).current;

  // Extra animations for new modes
  const headTilt = useRef(new Animated.Value(0)).current;
  const jumpAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Blinking - runs for all modes except sleeping
  useEffect(() => {
    if (mode === 'sleeping') return;

    const blink = () => {
      Animated.sequence([
        Animated.delay(2000 + Math.random() * 3000), // Random delay between blinks
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
        // Sometimes double blink
        ...(Math.random() > 0.7 ? [
          Animated.delay(100),
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
        ] : []),
      ]).start(() => blink());
    };
    blink();
  }, [mode]);

  // Ear twitches - occasional for all modes
  useEffect(() => {
    const twitch = () => {
      const ear = Math.random() > 0.5 ? leftEarRotate : rightEarRotate;
      Animated.sequence([
        Animated.delay(3000 + Math.random() * 5000),
        Animated.timing(ear, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(ear, {
          toValue: 0,
          duration: 150,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]).start(() => twitch());
    };
    twitch();
  }, []);

  // Mode-specific animations
  useEffect(() => {
    // Reset animations
    bodyBob.setValue(0);
    bodyRotate.setValue(0);
    breathe.setValue(1);
    armRotate.setValue(0);
    armY.setValue(0);
    headTilt.setValue(0);
    jumpAnim.setValue(0);
    shakeAnim.setValue(0);

    if (mode === 'peeking') {
      // Peek in with a bounce
      Animated.spring(peekAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Gentle sway while peeking
      Animated.loop(
        Animated.sequence([
          Animated.timing(bodyRotate, {
            toValue: 0.02,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bodyRotate, {
            toValue: -0.02,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    if (mode === 'sleeping') {
      // Deep breathing
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, {
            toValue: 1.08,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(breathe, {
            toValue: 1,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Slight head drop when sleeping
      Animated.loop(
        Animated.sequence([
          Animated.timing(bodyBob, {
            toValue: 3,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bodyBob, {
            toValue: 0,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    if (mode === 'munching') {
      // Mouth chomping
      Animated.loop(
        Animated.sequence([
          Animated.timing(mouthAnim, {
            toValue: 1,
            duration: 150,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(mouthAnim, {
            toValue: 0,
            duration: 150,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Cheek puffing while eating
      Animated.loop(
        Animated.sequence([
          Animated.timing(cheekPuff, {
            toValue: 1.15,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(cheekPuff, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Happy bobbing
      Animated.loop(
        Animated.sequence([
          Animated.timing(bodyBob, {
            toValue: -4,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bodyBob, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    if (mode === 'stirring' || mode === 'cooking') {
      // Rhythmic body movement
      Animated.loop(
        Animated.sequence([
          Animated.timing(bodyBob, {
            toValue: -3,
            duration: 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bodyBob, {
            toValue: 3,
            duration: 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Circular stirring motion
      Animated.loop(
        Animated.sequence([
          Animated.timing(armRotate, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(armRotate, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    if (mode === 'chopping') {
      // Quick chopping motion
      Animated.loop(
        Animated.sequence([
          Animated.timing(armY, {
            toValue: -10,
            duration: 100,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(armY, {
            toValue: 0,
            duration: 80,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(100),
        ])
      ).start();

      // Body recoil with each chop
      Animated.loop(
        Animated.sequence([
          Animated.timing(bodyBob, {
            toValue: 2,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(bodyBob, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.delay(100),
        ])
      ).start();
    }

    if (mode === 'waiting') {
      // Gentle idle sway
      Animated.loop(
        Animated.sequence([
          Animated.timing(bodyRotate, {
            toValue: 0.03,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bodyRotate, {
            toValue: -0.03,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Subtle breathing
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, {
            toValue: 1.03,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(breathe, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    if (mode === 'tasting') {
      // Head tilt back to taste
      Animated.loop(
        Animated.sequence([
          Animated.timing(headTilt, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(600),
          Animated.timing(headTilt, {
            toValue: 0,
            duration: 500,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(1000),
        ])
      ).start();

      // Satisfied nod
      Animated.loop(
        Animated.sequence([
          Animated.delay(1400),
          Animated.timing(bodyBob, {
            toValue: -3,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(bodyBob, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(bodyBob, {
            toValue: -3,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(bodyBob, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.delay(800),
        ])
      ).start();
    }

    if (mode === 'flipping') {
      // Quick flip motion with arm
      Animated.loop(
        Animated.sequence([
          Animated.timing(armRotate, {
            toValue: -0.5,
            duration: 200,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(armRotate, {
            toValue: 1.5,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(armRotate, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(1500),
        ])
      ).start();

      // Body follows the flip
      Animated.loop(
        Animated.sequence([
          Animated.timing(bodyBob, {
            toValue: -8,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bodyBob, {
            toValue: 0,
            duration: 400,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
          Animated.delay(1700),
        ])
      ).start();
    }

    if (mode === 'washing') {
      // Side to side scrubbing
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -1,
            duration: 150,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Body leans into wash
      Animated.loop(
        Animated.sequence([
          Animated.timing(bodyRotate, {
            toValue: 0.05,
            duration: 300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bodyRotate, {
            toValue: -0.05,
            duration: 300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    if (mode === 'cheering') {
      // Excited jumping
      Animated.loop(
        Animated.sequence([
          Animated.timing(jumpAnim, {
            toValue: -12,
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(jumpAnim, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.bounce),
            useNativeDriver: true,
          }),
          Animated.delay(300),
        ])
      ).start();

      // Arms up celebration
      Animated.loop(
        Animated.sequence([
          Animated.timing(armRotate, {
            toValue: 2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(armRotate, {
            toValue: 1.5,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(armRotate, {
            toValue: 2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.delay(100),
        ])
      ).start();
    }

    if (mode === 'seasoning') {
      // Shaking motion for seasoning
      Animated.loop(
        Animated.sequence([
          Animated.timing(armY, {
            toValue: -5,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(armY, {
            toValue: 0,
            duration: 80,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Gentle body sway while seasoning
      Animated.loop(
        Animated.sequence([
          Animated.timing(bodyRotate, {
            toValue: 0.02,
            duration: 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bodyRotate, {
            toValue: -0.02,
            duration: 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    if (mode === 'plating') {
      // Careful precise movements
      Animated.loop(
        Animated.sequence([
          Animated.timing(armRotate, {
            toValue: 0.3,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(300),
          Animated.timing(armRotate, {
            toValue: -0.2,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(300),
          Animated.timing(armRotate, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.delay(500),
        ])
      ).start();

      // Concentrated lean
      Animated.timing(bodyRotate, {
        toValue: 0.03,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }

    if (mode === 'running') {
      // Quick little running bob
      Animated.loop(
        Animated.sequence([
          Animated.timing(bodyBob, {
            toValue: -6,
            duration: 120,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bodyBob, {
            toValue: 0,
            duration: 120,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Body tilts forward while running
      Animated.timing(bodyRotate, {
        toValue: 0.08,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Arms pumping
      Animated.loop(
        Animated.sequence([
          Animated.timing(armRotate, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.timing(armRotate, {
            toValue: -0.3,
            duration: 120,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [mode]);

  // Interpolations
  const mouthScale = mouthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const armRotation = armRotate.interpolate({
    inputRange: [-0.5, 0, 1, 1.5, 2],
    outputRange: ['-15deg', '0deg', '25deg', '45deg', '80deg'],
  });

  const leftEarTwitch = leftEarRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-15deg'],
  });

  const rightEarTwitch = rightEarRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  const eyeScaleY = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 1],
  });

  const bodyRotation = bodyRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

  const headTiltRotation = headTilt.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-15deg'],
  });

  const shakeX = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-5, 5],
  });

  const isChef = ['cooking', 'stirring', 'chopping', 'waiting', 'tasting', 'flipping', 'washing', 'seasoning', 'plating'].includes(mode);
  const isCheering = mode === 'cheering';
  const isSleeping = mode === 'sleeping';
  const isMunching = mode === 'munching';
  const isPeeking = mode === 'peeking';
  const isTasting = mode === 'tasting';
  const isWashing = mode === 'washing';
  const isRunning = mode === 'running';

  // Determine which Y animation to use
  const yTranslate = isPeeking ? peekAnim : isCheering ? jumpAnim : bodyBob;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scale },
            { translateY: yTranslate },
            { translateX: isWashing ? shakeX : 0 },
            { rotate: isTasting ? headTiltRotation : bodyRotation },
            { scale: breathe },
          ],
        },
      ]}
    >
      {/* Chef Hat */}
      {isChef && (
        <View style={styles.chefHat}>
          <View style={styles.chefHatPuff1} />
          <View style={styles.chefHatPuff2} />
          <View style={styles.chefHatPuff3} />
          <View style={styles.chefHatBand} />
        </View>
      )}

      {/* Left Ear */}
      <Animated.View
        style={[
          styles.ear,
          styles.earLeft,
          { transform: [{ rotate: leftEarTwitch }] }
        ]}
      >
        <View style={styles.earInner} />
      </Animated.View>

      {/* Right Ear */}
      <Animated.View
        style={[
          styles.ear,
          styles.earRight,
          { transform: [{ rotate: rightEarTwitch }] }
        ]}
      >
        <View style={styles.earInner} />
      </Animated.View>

      {/* Head */}
      <View style={styles.head}>
        {/* Eyes */}
        <View style={styles.eyesContainer}>
          {/* Left Eye */}
          <View style={styles.eyeSocket}>
            {isSleeping ? (
              <View style={styles.eyeClosed} />
            ) : (
              <Animated.View style={[styles.eye, { transform: [{ scaleY: eyeScaleY }] }]}>
                <View style={styles.pupil}>
                  <View style={styles.pupilHighlight} />
                </View>
              </Animated.View>
            )}
          </View>

          {/* Right Eye */}
          <View style={styles.eyeSocket}>
            {isSleeping ? (
              <View style={styles.eyeClosed} />
            ) : (
              <Animated.View style={[styles.eye, { transform: [{ scaleY: eyeScaleY }] }]}>
                <View style={styles.pupil}>
                  <View style={styles.pupilHighlight} />
                </View>
              </Animated.View>
            )}
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

        {/* Mouth */}
        {isMunching ? (
          <Animated.View style={[styles.mouthOpen, { transform: [{ scaleY: mouthScale }] }]}>
            <View style={styles.tongue} />
          </Animated.View>
        ) : isSleeping ? (
          <View style={styles.mouthSleeping} />
        ) : (
          <View style={styles.mouthSmile} />
        )}

        {/* ZZZ for sleeping */}
        {isSleeping && (
          <View style={styles.zzzContainer}>
            <Animated.Text style={[styles.zzz, styles.zzz1]}>z</Animated.Text>
            <Animated.Text style={[styles.zzz, styles.zzz2]}>z</Animated.Text>
            <Animated.Text style={[styles.zzz, styles.zzz3]}>Z</Animated.Text>
          </View>
        )}

        {/* Happy sparkles when munching */}
        {isMunching && (
          <>
            <View style={[styles.sparkle, styles.sparkle1]} />
            <View style={[styles.sparkle, styles.sparkle2]} />
          </>
        )}
      </View>

      {/* Arm with utensil for chef */}
      {isChef && (
        <Animated.View
          style={[
            styles.armContainer,
            { transform: [{ rotate: armRotation }, { translateY: armY }] }
          ]}
        >
          <View style={styles.arm} />
          <View style={styles.hand} />
          <View style={styles.utensil}>
            <View style={styles.utensilHead} />
          </View>
        </Animated.View>
      )}

      {/* Cheering arms (both sides, no utensil) */}
      {isCheering && (
        <>
          <Animated.View
            style={[
              styles.armContainer,
              styles.armLeft,
              { transform: [{ rotate: armRotation }, { scaleX: -1 }] }
            ]}
          >
            <View style={styles.arm} />
            <View style={styles.hand} />
          </Animated.View>
          <Animated.View
            style={[
              styles.armContainer,
              { transform: [{ rotate: armRotation }] }
            ]}
          >
            <View style={styles.arm} />
            <View style={styles.hand} />
          </Animated.View>
        </>
      )}

      {/* Running arms */}
      {isRunning && (
        <>
          <Animated.View
            style={[
              styles.armContainer,
              styles.armLeft,
              { transform: [{ rotate: armRotation }, { scaleX: -1 }] }
            ]}
          >
            <View style={styles.arm} />
            <View style={styles.hand} />
          </Animated.View>
          <Animated.View
            style={[
              styles.armContainer,
              { transform: [{ rotate: armRotation }] }
            ]}
          >
            <View style={styles.arm} />
            <View style={styles.hand} />
          </Animated.View>
        </>
      )}

      {/* Food being carried */}
      {carryingFood && (
        <View style={styles.carryingFood}>
          <View style={styles.foodPlate}>
            <Text style={styles.foodEmoji}>{carryingFood}</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 95,
    alignItems: 'center',
  },

  // Chef Hat - more puffy and cute
  chefHat: {
    position: 'absolute',
    top: -18,
    alignItems: 'center',
    zIndex: 10,
  },
  chefHatPuff1: {
    width: 20,
    height: 18,
    backgroundColor: '#fff',
    borderRadius: 10,
    position: 'absolute',
    left: -5,
    top: 0,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  chefHatPuff2: {
    width: 22,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 11,
    position: 'absolute',
    left: 7,
    top: -5,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  chefHatPuff3: {
    width: 20,
    height: 18,
    backgroundColor: '#fff',
    borderRadius: 10,
    position: 'absolute',
    left: 20,
    top: 0,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  chefHatBand: {
    width: 42,
    height: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    marginTop: 15,
    borderRadius: 2,
  },

  // Ears - rounder with inner detail
  ear: {
    position: 'absolute',
    width: 18,
    height: 18,
    backgroundColor: '#8B7B6B',
    borderRadius: 9,
    top: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earLeft: {
    left: 5,
    transform: [{ rotate: '-10deg' }],
  },
  earRight: {
    right: 5,
    transform: [{ rotate: '10deg' }],
  },
  earInner: {
    width: 10,
    height: 10,
    backgroundColor: '#A89888',
    borderRadius: 5,
  },

  // Head
  head: {
    width: 72,
    height: 62,
    backgroundColor: '#9C8B7A',
    borderRadius: 32,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  // Eyes
  eyesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 38,
    marginTop: -5,
  },
  eyeSocket: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: {
    width: 14,
    height: 14,
    backgroundColor: '#fff',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeClosed: {
    width: 12,
    height: 3,
    backgroundColor: '#2d3436',
    borderRadius: 2,
  },
  pupil: {
    width: 8,
    height: 8,
    backgroundColor: '#2d3436',
    borderRadius: 4,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingLeft: 2,
    paddingTop: 1,
  },
  pupilHighlight: {
    width: 3,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
  },

  // Blush
  blush: {
    position: 'absolute',
    width: 10,
    height: 6,
    backgroundColor: 'rgba(255, 182, 193, 0.6)',
    borderRadius: 5,
    top: 25,
  },
  blushLeft: {
    left: 8,
  },
  blushRight: {
    right: 8,
  },

  // Snout
  snout: {
    width: 38,
    height: 20,
    backgroundColor: '#B8A99A',
    borderRadius: 10,
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  nostril: {
    width: 5,
    height: 7,
    backgroundColor: '#6D5D4E',
    borderRadius: 3,
  },

  // Mouths
  mouthSmile: {
    width: 12,
    height: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#6D5D4E',
    borderRadius: 6,
    marginTop: 2,
  },
  mouthSleeping: {
    width: 8,
    height: 4,
    backgroundColor: '#B8A99A',
    borderRadius: 4,
    marginTop: 2,
  },
  mouthOpen: {
    width: 18,
    height: 12,
    backgroundColor: '#E57373',
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  tongue: {
    width: 10,
    height: 8,
    backgroundColor: '#F48FB1',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },

  // ZZZ
  zzzContainer: {
    position: 'absolute',
    right: -12,
    top: -5,
    flexDirection: 'column',
  },
  zzz: {
    color: '#74b9ff',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  zzz1: {
    fontSize: 8,
    marginLeft: 8,
    opacity: 0.5,
  },
  zzz2: {
    fontSize: 11,
    marginLeft: 4,
    opacity: 0.7,
  },
  zzz3: {
    fontSize: 14,
    opacity: 1,
  },

  // Sparkles for happy munching
  sparkle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  sparkle1: {
    top: -5,
    left: 10,
    transform: [{ rotate: '45deg' }],
  },
  sparkle2: {
    top: -3,
    right: 12,
    transform: [{ rotate: '45deg' }],
  },

  // Arm and utensil
  armContainer: {
    position: 'absolute',
    right: -8,
    bottom: 18,
    alignItems: 'center',
  },
  armLeft: {
    right: undefined,
    left: -8,
  },
  arm: {
    width: 8,
    height: 15,
    backgroundColor: '#9C8B7A',
    borderRadius: 4,
  },
  hand: {
    width: 12,
    height: 10,
    backgroundColor: '#9C8B7A',
    borderRadius: 5,
    marginTop: -2,
  },
  utensil: {
    width: 4,
    height: 28,
    backgroundColor: '#8B4513',
    borderRadius: 2,
    marginTop: -3,
    alignItems: 'center',
  },
  utensilHead: {
    width: 12,
    height: 8,
    backgroundColor: '#A0522D',
    borderRadius: 2,
    position: 'absolute',
    bottom: 0,
  },

  // Food carrying
  carryingFood: {
    position: 'absolute',
    top: -5,
    alignItems: 'center',
  },
  foodPlate: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  foodEmoji: {
    fontSize: 18,
  },
});
