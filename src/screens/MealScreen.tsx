import { useState, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, Modal, ScrollView } from 'react-native';
import { getMakeableMeals, canSubstituteIngredient, getIngredientName } from '../utils/mealMatcher';
import { useFridgeStore } from '../store/fridgeStore';
import { usePantryStore } from '../store/pantryStore';
import { meals } from '../data/meals';
import { ingredients as allIngredients } from '../data/ingredients';
import { TouchableOpacity } from 'react-native';
import { Meal } from '../types';
import HippoRamen from '../components/HippoRamen';

// Calculate max meals you can actually cook (greedy, accounting for servings)
function calculateMaxMeals(makeableMeals: Meal[], fridgeItems: any[]): number {
  // Create a map of ingredientId -> servingsRemaining
  const servingsMap = new Map<string, number>();
  fridgeItems.forEach((item: any) => {
    servingsMap.set(item.ingredient.id, item.servingsRemaining ?? item.ingredient.servings);
  });

  let count = 0;
  let changed = true;

  // Keep trying to make meals until no more can be made
  while (changed) {
    changed = false;
    for (const meal of makeableMeals) {
      const canMake = meal.requiredIngredients.every(id => (servingsMap.get(id) || 0) >= 1);
      if (canMake) {
        // Use one serving of each ingredient
        meal.requiredIngredients.forEach(id => {
          servingsMap.set(id, (servingsMap.get(id) || 0) - 1);
        });
        count++;
        changed = true;
        break; // Restart loop to re-check all meals
      }
    }
  }
  return count;
}

// Check which meals would still be makeable after cooking a selected meal
function getMealsAfterCooking(
  selectedMeal: Meal,
  makeableMeals: Meal[],
  fridgeItems: any[],
  pantryItems: Set<string>
): Set<string> {
  // Create a map of ingredientId -> servingsRemaining (fridge items only)
  const servingsMap = new Map<string, number>();
  fridgeItems.forEach((item: any) => {
    servingsMap.set(item.ingredient.id, item.servingsRemaining ?? item.ingredient.servings);
  });

  // Build set of all fridge ingredient IDs for substitution checks
  const fridgeIds = new Set(fridgeItems.map((item: any) => item.ingredient.id));

  // Use one serving of each fridge ingredient for the selected meal
  // (pantry items don't consume servings)
  selectedMeal.requiredIngredients.forEach(id => {
    // Check if this ingredient is in pantry (infinite) - don't decrement
    if (pantryItems.has(id)) return;

    // Check if we have this exact ingredient or a substitute in fridge
    if (servingsMap.has(id)) {
      servingsMap.set(id, (servingsMap.get(id) || 0) - 1);
    } else {
      // Check for substitute that we have
      const hasSubstitute = canSubstituteIngredient(id, fridgeIds);
      if (hasSubstitute) {
        // Find which substitute we have and decrement it
        for (const [ingId, servings] of servingsMap) {
          if (canSubstituteIngredient(id, new Set([ingId]))) {
            servingsMap.set(ingId, servings - 1);
            break;
          }
        }
      }
    }
  });

  // Check which meals are still possible
  const stillMakeable = new Set<string>();
  for (const meal of makeableMeals) {
    if (meal.id === selectedMeal.id) continue;

    // A meal is makeable if all ingredients are either:
    // 1. In pantry (infinite), or
    // 2. In fridge (with substitutes) with >= 1 serving remaining
    const canMake = meal.requiredIngredients.every(id => {
      if (pantryItems.has(id)) return true;

      // Check direct match
      if ((servingsMap.get(id) || 0) >= 1) return true;

      // Check substitutes
      for (const [ingId, servings] of servingsMap) {
        if (servings >= 1 && canSubstituteIngredient(id, new Set([ingId]))) {
          return true;
        }
      }
      return false;
    });

    if (canMake) stillMakeable.add(meal.id);
  }
  return stillMakeable;
}

export default function MealScreen({ navigation }: any) {
  const { fridgeItems, leftovers, eatLeftover } = useFridgeStore();
  const { pantryItems } = usePantryStore();
  const availableRecipes = getMakeableMeals(fridgeItems, meals, pantryItems);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showModal, setShowModal] = useState(false);

  const totalMeals = useMemo(() =>
    calculateMaxMeals(availableRecipes, fridgeItems),
    [availableRecipes, fridgeItems]
  );

  const stillMakeableAfter = useMemo(() =>
    selectedMeal ? getMealsAfterCooking(selectedMeal, availableRecipes, fridgeItems, pantryItems) : null,
    [selectedMeal, availableRecipes, fridgeItems, pantryItems]
  );

  // Get ingredient details for selected meal - separate fresh ingredients from pantry
  const { freshIngredients, pantryIngredients } = useMemo(() => {
    if (!selectedMeal) return { freshIngredients: [], pantryIngredients: [] };

    const fresh: { id: string; name: string; amount: string }[] = [];
    const pantry: { id: string; name: string }[] = [];

    selectedMeal.requiredIngredients.forEach(id => {
      const ingredient = allIngredients.find(i => i.id === id);
      const isPantry = pantryItems.has(id) || ingredient?.category === 'pantry';

      if (isPantry) {
        pantry.push({
          id,
          name: ingredient?.name || getIngredientName(id),
        });
      } else {
        const amount = selectedMeal.ingredientAmounts?.find(a => a.ingredientId === id);
        fresh.push({
          id,
          name: ingredient?.name || getIngredientName(id),
          amount: amount?.amount || '適量',
        });
      }
    });

    return { freshIngredients: fresh, pantryIngredients: pantry };
  }, [selectedMeal, pantryItems]);

  const servingsPerRecipe = selectedMeal?.servingsPerRecipe || 2;

  const handleStartCooking = () => {
    if (!selectedMeal) return;
    setShowModal(false);
    navigation.navigate('Cooking', { meal: selectedMeal });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meals</Text>
      { availableRecipes.length === 0 ? (
        <View style={styles.emptyState}>
          <HippoRamen size={180} />
          <Text style={styles.emptyTitle}>Hungry for ramen?</Text>
          <Text style={styles.subtitle}>Time to go shopping!</Text>
        </View>
      ) : (
        <>
        <Text style={styles.mealCount}>
          {totalMeals} meals from {availableRecipes.length} recipes
        </Text>

        {/* Leftovers Section */}
        {leftovers.length > 0 && (() => {
          const now = new Date();
          const SHELF_LIFE_DAYS = 2;

          // Filter and sort leftovers by expiry
          const validLeftovers = leftovers
            .map(leftover => {
              const cookedDate = new Date(leftover.cookedDate);
              const expiryDate = new Date(cookedDate.getTime() + SHELF_LIFE_DAYS * 24 * 60 * 60 * 1000);
              const hoursLeft = Math.max(0, Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60)));
              const isExpired = hoursLeft <= 0;
              return { ...leftover, hoursLeft, isExpired };
            })
            .filter(l => !l.isExpired)
            .sort((a, b) => a.hoursLeft - b.hoursLeft);

          if (validLeftovers.length === 0) return null;

          return (
            <View style={styles.leftoversSection}>
              <Text style={styles.leftoversTitle}>Leftovers</Text>
              {validLeftovers.map((leftover) => {
                const isUrgent = leftover.hoursLeft <= 12;
                return (
                  <View key={leftover.id} style={[styles.leftoverCard, isUrgent && styles.leftoverCardUrgent]}>
                    <Text style={styles.leftoverEmoji}>{leftover.mealEmoji}</Text>
                    <View style={styles.leftoverInfo}>
                      <Text style={styles.leftoverName}>{leftover.mealNameJp}</Text>
                      <Text style={[styles.leftoverServings, isUrgent && styles.leftoverUrgentText]}>
                        {leftover.servingsRemaining} portion{leftover.servingsRemaining > 1 ? 's' : ''} • {leftover.hoursLeft}h left
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.eatButton, isUrgent && styles.eatButtonUrgent]}
                      onPress={() => eatLeftover(leftover.id)}
                    >
                      <Text style={styles.eatButtonText}>Eat 1</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          );
        })()}

        {selectedMeal && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.startButtonText}>View Recipe: {selectedMeal.nameJp}</Text>
          </TouchableOpacity>
        )}

        {/* Recipe Details Modal */}
        <Modal
          visible={showModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedMeal && (
                <ScrollView>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalEmoji}>{selectedMeal.imageEmoji}</Text>
                    <Text style={styles.modalTitle}>{selectedMeal.nameJp}</Text>
                    <Text style={styles.modalSubtitle}>{selectedMeal.name}</Text>
                    <Text style={styles.servingsLabel}>{servingsPerRecipe}人前</Text>
                  </View>

                  <Text style={styles.ingredientHeader}>材料 / Ingredients</Text>
                  {freshIngredients.map((ing) => (
                    <View key={ing.id} style={styles.ingredientRow}>
                      <Text style={styles.ingredientName}>{ing.name}</Text>
                      <Text style={styles.ingredientAmount}>{ing.amount}</Text>
                    </View>
                  ))}

                  {pantryIngredients.length > 0 && (
                    <View style={styles.pantrySection}>
                      <Text style={styles.pantryHeader}>調味料 / From Pantry</Text>
                      <Text style={styles.pantryList}>
                        {pantryIngredients.map(p => p.name).join('、')}
                      </Text>
                    </View>
                  )}

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.cookButton}
                      onPress={handleStartCooking}
                    >
                      <Text style={styles.cookButtonText}>Start Cooking</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setShowModal(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        <FlatList
          data={availableRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => {
            const isSelected = selectedMeal?.id === item.id;
            const isGreyedOut = selectedMeal && !isSelected && stillMakeableAfter && !stillMakeableAfter.has(item.id);

            return (
              <TouchableOpacity
                onPress={() => {
                  if (isSelected) {
                    setSelectedMeal(null);
                  } else {
                    setSelectedMeal(item);
                  }
                }}
              >
                <View style={[
                  styles.mealCard,
                  isSelected && styles.mealCardSelected,
                  isGreyedOut && styles.mealCardGreyed
                ]}>
                  <Text style={[styles.emoji, isGreyedOut && styles.emojiGreyed]}>
                    {item.imageEmoji}
                  </Text>
                  <View style={styles.mealInfo}>
                    <Text style={[styles.mealName, isGreyedOut && styles.textGreyed]}>
                      {item.nameJp}
                    </Text>
                    <Text style={[styles.mealNameEn, isGreyedOut && styles.textGreyed]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.mealMeta, isGreyedOut && styles.textGreyed]}>
                      ⏱ {item.totalTimeMinutes}min
                    </Text>
                  </View>
                  {isGreyedOut && (
                    <Text style={styles.unavailableTag}>Not after</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f7',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginTop: 20,
    marginBottom: 8,
  },
  mealCount: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 8,
  },
  // Leftovers styles
  leftoversSection: {
    marginBottom: 16,
  },
  leftoversTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e17055',
    marginBottom: 8,
  },
  leftoverCard: {
    backgroundColor: '#ffeaa7',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  leftoverEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  leftoverInfo: {
    flex: 1,
  },
  leftoverName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3436',
  },
  leftoverServings: {
    fontSize: 12,
    color: '#636e72',
  },
  eatButton: {
    backgroundColor: '#e17055',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  eatButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  leftoverCardUrgent: {
    backgroundColor: '#ffcccc',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  leftoverUrgentText: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  eatButtonUrgent: {
    backgroundColor: '#e74c3c',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  emoji: {
    fontSize: 40,
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
  },
  mealNameEn: {
    fontSize: 14,
    color: '#636e72',
  },
  mealMeta: {
    fontSize: 12,
    color: '#74b9ff',
    marginTop: 4,
  },
  mealCardSelected: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#f0fff0',
  },
  mealCardGreyed: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  emojiGreyed: {
    opacity: 0.4,
  },
  textGreyed: {
    color: '#b2bec3',
  },
  unavailableTag: {
    fontSize: 10,
    color: '#e74c3c',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalEmoji: {
    fontSize: 60,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#636e72',
    marginTop: 4,
  },
  servingsLabel: {
    fontSize: 14,
    color: '#74b9ff',
    marginTop: 8,
    fontWeight: '600',
  },
  ingredientHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dfe6e9',
    paddingBottom: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ingredientName: {
    fontSize: 15,
    color: '#2d3436',
  },
  ingredientAmount: {
    fontSize: 15,
    color: '#636e72',
  },
  pantrySection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  pantryHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#b2bec3',
    marginBottom: 4,
  },
  pantryList: {
    fontSize: 13,
    color: '#636e72',
    lineHeight: 20,
  },
  modalButtons: {
    marginTop: 24,
    gap: 12,
  },
  cookButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ateButton: {
    backgroundColor: '#74b9ff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#636e72',
    fontSize: 16,
  },
});
