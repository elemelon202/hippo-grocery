import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useFridgeStore } from '../store/fridgeStore';
import { useMealHistoryStore } from '../store/mealHistoryStore';
import { usePantryStore } from '../store/pantryStore';
import Hippo, { HippoMode } from '../components/Hippo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Running hippo component that moves across the screen
function RunningHippo({ delay, food, direction }: { delay: number; food: string; direction: 'left' | 'right' }) {
  const translateX = useRef(new Animated.Value(direction === 'left' ? SCREEN_WIDTH + 50 : -100)).current;

  useEffect(() => {
    const runAcross = () => {
      translateX.setValue(direction === 'left' ? SCREEN_WIDTH + 50 : -100);
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateX, {
          toValue: direction === 'left' ? -100 : SCREEN_WIDTH + 50,
          duration: 4000 + Math.random() * 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => runAcross());
    };
    runAcross();
  }, []);

  return (
    <Animated.View
      style={[
        styles.runningHippoContainer,
        {
          transform: [
            { translateX },
            { scaleX: direction === 'left' ? 1 : -1 },
          ],
        },
      ]}
    >
      <Hippo mode="running" size={45} carryingFood={food} />
    </Animated.View>
  );
}

export default function CookingScreen({ route, navigation }: any) {
  const { meal } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [portionsEaten, setPortionsEaten] = useState(1);
  const { useIngredient, addLeftover } = useFridgeStore();
  const { pantryItems } = usePantryStore();
  const { addMealToHistory } = useMealHistoryStore();

  const servingsPerRecipe = meal.servingsPerRecipe || 2;
  const step = meal.cookingSteps[currentStep];
  const isLastStep = currentStep === meal.cookingSteps.length - 1;
  const progress = ((currentStep + 1) / meal.cookingSteps.length) * 100;

  const handleComplete = () => {
    // Just show celebration - don't remove ingredients yet
    setShowCelebration(true);
  };

  const handleFinish = () => {
    // Decrement servings for each ingredient used (skip pantry items)
    meal.requiredIngredients.forEach((id: string) => {
      if (!pantryItems.has(id)) {
        useIngredient(id);
      }
    });
    // Record this meal for variety tracking
    addMealToHistory(meal.id);

    // Save leftovers if not all portions eaten
    const leftoverPortions = servingsPerRecipe - portionsEaten;
    if (leftoverPortions > 0) {
      addLeftover({
        id: `leftover-${meal.id}-${Date.now()}`,
        mealId: meal.id,
        mealName: meal.name,
        mealNameJp: meal.nameJp,
        mealEmoji: meal.imageEmoji,
        servingsRemaining: leftoverPortions,
        cookedDate: new Date(),
      });
    }

    setShowCelebration(false);
    navigation.goBack();
  };

  const handleCancel = () => {
    // Go back without removing ingredients
    setShowCelebration(false);
    navigation.goBack();
  };

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Chef actions for main hippo - changes every few seconds
  const chefActions: HippoMode[] = ['stirring', 'chopping', 'cooking', 'tasting', 'flipping', 'seasoning', 'plating'];
  const [mainHippoMode, setMainHippoMode] = useState<HippoMode>(chefActions[0]);

  // Randomly change main hippo action
  useEffect(() => {
    const interval = setInterval(() => {
      const randomAction = chefActions[Math.floor(Math.random() * chefActions.length)];
      setMainHippoMode(randomAction);
    }, 3000 + Math.random() * 2000); // Change every 3-5 seconds

    return () => clearInterval(interval);
  }, []);

  // Food emojis for running hippos
  const foodEmojis = ['🥕', '🥬', '🍳', '🥩', '🧅', '🍚', '🥢', '🫘', '🥒', '🍖'];

  // Celebration screen
  if (showCelebration) {
    const leftoverPortions = servingsPerRecipe - portionsEaten;

    return (
      <View style={styles.celebrationContainer}>
        {/* Hippo party! */}
        <View style={styles.celebrationHippos}>
          <View style={styles.celebrationHelper}>
            <Hippo mode="cheering" size={60} />
          </View>
          <Hippo mode="munching" size={100} />
          <View style={styles.celebrationHelper}>
            <Hippo mode="cheering" size={60} />
          </View>
        </View>
        <Text style={styles.celebrationTitle}>おいしくできた!</Text>
        <Text style={styles.celebrationSubtitle}>Meal Complete!</Text>
        <Text style={styles.celebrationMeal}>{meal.imageEmoji} {meal.nameJp}</Text>

        {/* Portion Selection */}
        <Text style={styles.portionLabel}>How many portions did you eat?</Text>
        <Text style={styles.portionSublabel}>(Recipe makes {servingsPerRecipe}人前)</Text>
        <View style={styles.portionSelector}>
          {Array.from({ length: servingsPerRecipe }, (_, i) => i + 1).map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.portionButton,
                portionsEaten === num && styles.portionButtonActive,
              ]}
              onPress={() => setPortionsEaten(num)}
            >
              <Text
                style={[
                  styles.portionButtonText,
                  portionsEaten === num && styles.portionButtonTextActive,
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {leftoverPortions > 0 && (
          <Text style={styles.leftoverNote}>
            {leftoverPortions} portion{leftoverPortions > 1 ? 's' : ''} will be saved as leftovers
          </Text>
        )}

        <TouchableOpacity style={styles.celebrationButton} onPress={handleFinish}>
          <Text style={styles.celebrationButtonText}>
            {leftoverPortions > 0 ? `Done (Save ${leftoverPortions} Leftover)` : 'Done'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.mealName}>{meal.nameJp}</Text>
        <Text style={styles.stepCounter}>Step {currentStep + 1} of {meal.cookingSteps.length}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.stepTitle}>{step.titleJp}</Text>
        <Text style={styles.stepTitleEn}>{step.title}</Text>

        <View style={styles.instructionBox}>
          <Text style={styles.instructionJp}>{step.instructionsJp}</Text>
          <Text style={styles.instructionEn}>{step.instructions}</Text>
        </View>

        {/* Air Fryer Box */}
        {step.airFryerStep && (
          <View style={styles.airFryerBox}>
            <Text style={styles.airFryerTitle}>🔥 Air Fryer</Text>
            <View style={styles.airFryerSettings}>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.airFryerValue}>{step.airFryerStep.temperature}°C</Text>
                <Text style={styles.airFryerLabel}>Temperature</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.airFryerValue}>{step.airFryerStep.timeMinutes} min</Text>
                <Text style={styles.airFryerLabel}>Time</Text>
              </View>
            </View>
          </View>
        )}

        {/* Duration */}
        {step.durationMinutes && (
          <Text style={styles.duration}>⏱ ~{step.durationMinutes} minutes</Text>
        )}

        {/* Main Chef Hippo */}
        <View style={styles.kitchenContainer}>
          <View style={styles.mainChefHippo}>
            <Hippo mode={mainHippoMode} size={80} />
          </View>
        </View>
      </ScrollView>

      {/* Running helper hippos carrying ingredients */}
      <View style={styles.runningHipposLayer}>
        <RunningHippo delay={0} food={foodEmojis[currentStep % foodEmojis.length]} direction="left" />
        <RunningHippo delay={2500} food={foodEmojis[(currentStep + 3) % foodEmojis.length]} direction="right" />
        <RunningHippo delay={5000} food={foodEmojis[(currentStep + 6) % foodEmojis.length]} direction="left" />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, currentStep === 0 && { flex: 1 }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {isLastStep ? 'Done! 🎉' : 'Next Step →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#faf9f7',
      paddingTop: 60,
    },
    header: {
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    mealName: {
      fontSize: 18,
      fontWeight: '600',
      color: '#2d3436',
    },
    stepCounter: {
      fontSize: 14,
      color: '#636e72',
    },
    progressBar: {
      height: 4,
      backgroundColor: '#e0e0e0',
      marginHorizontal: 20,
      borderRadius: 2,
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#4CAF50',
      borderRadius: 2,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    stepTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#2d3436',
      marginBottom: 4,
    },
    stepTitleEn: {
      fontSize: 16,
      color: '#636e72',
      marginBottom: 20,
    },
    instructionBox: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 12,
      marginBottom: 16,
    },
    instructionJp: {
      fontSize: 18,
      lineHeight: 28,
      color: '#2d3436',
      marginBottom: 8,
    },
    instructionEn: {
      fontSize: 15,
      color: '#636e72',
    },
    airFryerBox: {
      backgroundColor: '#fff3e0',
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#ff9800',
      marginBottom: 16,
    },
    airFryerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#e65100',
      marginBottom: 12,
    },
    airFryerSettings: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    airFryerValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#e65100',
    },
    airFryerLabel: {
      fontSize: 12,
      color: '#bf360c',
    },
    duration: {
      fontSize: 14,
      color: '#636e72',
      textAlign: 'center',
      marginTop: 8,
    },
    kitchenContainer: {
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 10,
    },
    mainChefHippo: {
      alignItems: 'center',
    },
    runningHipposLayer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 100,
      height: 60,
      pointerEvents: 'none',
    },
    runningHippoContainer: {
      position: 'absolute',
      bottom: 0,
    },
    footer: {
      flexDirection: 'row',
      padding: 20,
      gap: 12,
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
    },
    backButton: {
      flex: 1,
      backgroundColor: '#e0e0e0',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#636e72',
    },
    nextButton: {
      flex: 2,
      backgroundColor: '#74b9ff',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    nextButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
    },
    celebrationContainer: {
      flex: 1,
      backgroundColor: '#faf9f7',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    celebrationHippos: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
      marginBottom: 20,
    },
    celebrationHelper: {
      marginHorizontal: 5,
    },
    fireworks: {
      fontSize: 80,
      marginBottom: 20,
    },
    celebrationTitle: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#2d3436',
      marginBottom: 8,
    },
    celebrationSubtitle: {
      fontSize: 18,
      color: '#636e72',
      marginBottom: 24,
    },
    celebrationMeal: {
      fontSize: 24,
      color: '#2d3436',
      marginBottom: 40,
    },
    celebrationButton: {
      backgroundColor: '#4CAF50',
      paddingHorizontal: 40,
      paddingVertical: 16,
      borderRadius: 12,
    },
    celebrationButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#fff',
    },
    cancelButton: {
      marginTop: 12,
      paddingHorizontal: 40,
      paddingVertical: 12,
    },
    cancelButtonText: {
      fontSize: 16,
      color: '#636e72',
    },
    // Portion selection styles
    portionLabel: {
      fontSize: 16,
      color: '#2d3436',
      marginTop: 20,
      fontWeight: '600',
    },
    portionSublabel: {
      fontSize: 13,
      color: '#636e72',
      marginBottom: 12,
    },
    portionSelector: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    portionButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#e0e0e0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    portionButtonActive: {
      backgroundColor: '#4CAF50',
    },
    portionButtonText: {
      fontSize: 20,
      fontWeight: '600',
      color: '#636e72',
    },
    portionButtonTextActive: {
      color: '#fff',
    },
    leftoverNote: {
      fontSize: 14,
      color: '#e17055',
      marginBottom: 20,
      fontWeight: '500',
    },
  });
