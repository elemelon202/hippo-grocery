import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ingredients } from '../data/ingredients';
import { meals } from '../data/meals';
import { planWeekMeals, WeekPlan } from '../utils/mealPlanner';
import { useShoppingStore, ShoppingItem } from '../store/shoppingListStore';
import { useFridgeStore } from '../store/fridgeStore';
import { useMealHistoryStore } from '../store/mealHistoryStore';
import { usePantryStore } from '../store/pantryStore';
import { getSuggestedPantryItems } from '../utils/mealMatcher';
import Hippo from '../components/Hippo';

export default function ShoppingScreen() {
  const { items, extras, budget, setList, toggleItem, addExtra, toggleExtra, setBudget, clearList } = useShoppingStore();
  const { fridgeItems, addItem } = useFridgeStore();
  const { recentMealIds } = useMealHistoryStore();
  const { pantryItems, addToPantry, resetToDefaults } = usePantryStore();
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);

  // Get suggested pantry items that would unlock more recipes
  const pantrySuggestions = useMemo(() =>
    getSuggestedPantryItems(fridgeItems, meals, pantryItems, 3),
    [fridgeItems, pantryItems]
  );

  // Get pantry item names for reference list
  const pantryItemNames = useMemo(() => {
    return Array.from(pantryItems)
      .map(id => ingredients.find(i => i.id === id)?.name)
      .filter(Boolean)
      .join('、');
  }, [pantryItems]);

  // Calculate dynamic spend - checked main items + checked extras
  const spentAmount = useMemo(() => {
    const mainSpent = items
      .filter(item => item.checked)
      .reduce((sum, item) => sum + item.ingredient.typicalPrice, 0);
    const extrasSpent = extras
      .filter(item => item.checked)
      .reduce((sum, item) => sum + item.ingredient.typicalPrice, 0);
    return mainSpent + extrasSpent;
  }, [items, extras]);

  const handlePlanWeek = (peopleCount: number) => {
    const plan = planWeekMeals(budget, peopleCount, meals, ingredients, recentMealIds, fridgeItems, pantryItems);
    setWeekPlan(plan);
    setList(plan.shoppingList);
  };

  const handleClick = (item: ShoppingItem) => {
    toggleItem(item.ingredient.id);
    addItem(item.ingredient);
  };

  const handleClearAll = () => {
    clearList();
    setWeekPlan(null);
  };

  const allMainChecked = items.length > 0 && items.every(item => item.checked);
  const allExtrasChecked = extras.length === 0 || extras.every(item => item.checked);
  const allChecked = allMainChecked && allExtrasChecked;

  const completeMeals = weekPlan?.plannedMeals.filter(pm => !pm.isQuickFix).length || 0;
  const quickFixMeals = weekPlan?.plannedMeals.filter(pm => pm.isQuickFix).length || 0;

  // Handle adding pantry suggestion as an extra shopping item
  const handleAddPantrySuggestion = (ingredient: any) => {
    addExtra(ingredient);
    addToPantry(ingredient.id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>買い物リスト</Text>
      <Text style={styles.subtitle}>Build a capable fridge</Text>

      {/* Budget Input */}
      <View style={styles.budgetRow}>
        <Text style={styles.yen}>¥</Text>
        <TextInput
          style={styles.input}
          value={String(budget)}
          onChangeText={(text) => setBudget(parseInt(text) || 0)}
          keyboardType="number-pad"
          placeholder="5000"
        />
      </View>

      {/* Shop for X buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.peopleButton, styles.peopleButton1]}
          onPress={() => handlePlanWeek(1)}
        >
          <Text style={styles.peopleButtonText}>🧑 For 1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.peopleButton, styles.peopleButton2]}
          onPress={() => handlePlanWeek(2)}
        >
          <Text style={styles.peopleButtonText}>👫 For 2</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.peopleButton, styles.peopleButton4]}
          onPress={() => handlePlanWeek(4)}
        >
          <Text style={styles.peopleButtonText}>👨‍👩‍👧‍👦 For 4</Text>
        </TouchableOpacity>
      </View>

      {weekPlan && (
        <>
          <ScrollView style={styles.results} contentContainerStyle={styles.resultsContent}>
            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                Unlocks {weekPlan.mealsPlanned} recipes
              </Text>
              <Text style={styles.summaryDetails}>
                {completeMeals} balanced • {quickFixMeals} quick
              </Text>
            </View>

            {/* Shopping List */}
            <Text style={styles.sectionTitle}>Shopping List</Text>
            {items.map((item) => (
              <TouchableOpacity key={item.ingredient.id} onPress={() => handleClick(item)}>
                <View style={styles.item}>
                  <View style={styles.itemLeft}>
                    <Text style={[styles.itemName, item.checked && styles.checkedText]}>
                      {item.ingredient.name}
                    </Text>
                    {item.ingredient.purchaseQuantity && (
                      <Text style={[styles.itemQuantity, item.checked && styles.checkedText]}>
                        {item.ingredient.purchaseQuantity}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.itemPrice}>¥{item.ingredient.typicalPrice}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Extras section - pantry items added to cart */}
            {extras.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Extras</Text>
                {extras.map((item) => (
                  <TouchableOpacity key={item.ingredient.id} onPress={() => toggleExtra(item.ingredient.id)}>
                    <View style={[styles.item, styles.extraItem]}>
                      <View style={styles.itemLeft}>
                        <Text style={[styles.itemName, item.checked && styles.checkedText]}>
                          {item.ingredient.name}
                        </Text>
                        <Text style={[styles.itemQuantity, item.checked && styles.checkedText]}>
                          Pantry staple
                        </Text>
                      </View>
                      <Text style={styles.itemPrice}>¥{item.ingredient.typicalPrice}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Clear All button - shows when all items checked */}
            {allChecked && (
              <TouchableOpacity style={styles.clearAllButton} onPress={handleClearAll}>
                <Text style={styles.clearAllText}>All done! Clear list</Text>
              </TouchableOpacity>
            )}

            {/* Pantry upgrade suggestions */}
            {pantrySuggestions.length > 0 && (
              <>
                <Text style={styles.pantrySectionTitle}>Expand Your Pantry</Text>
                <Text style={styles.pantrySubtitle}>One-time buys that unlock more recipes</Text>
                {pantrySuggestions.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion.ingredient.id}
                    style={styles.pantryItem}
                    onPress={() => handleAddPantrySuggestion(suggestion.ingredient)}
                  >
                    <View style={styles.pantryItemInfo}>
                      <Text style={styles.pantryItemName}>{suggestion.ingredient.name}</Text>
                      <Text style={styles.pantryItemMeta}>
                        +{suggestion.unlocksCount} recipes • ¥{suggestion.ingredient.typicalPrice}
                      </Text>
                    </View>
                    <Text style={styles.pantryAddButton}>+ Add</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>

          {/* Fixed total bar at bottom */}
          <View style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Spent</Text>
              <Text style={styles.spentAmount}>¥{spentAmount}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.budgetLabel}>Budget</Text>
              <Text style={styles.budgetAmount}>¥{weekPlan.totalCost}</Text>
            </View>
          </View>

          {/* Peeking hippo in corner */}
          <View style={styles.peekingHippo}>
            <Hippo mode="peeking" size={60} />
          </View>
        </>
      )}

      {!weekPlan && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyText}>Set budget, tap how many people</Text>
          <Text style={styles.emptySubtext}>The hippos suggest ingredients that unlock the most recipes</Text>

          {/* Pantry reference list */}
          <View style={styles.pantryInfo}>
            <Text style={styles.pantryInfoTitle}>
              🏺 Already in Pantry ({pantryItems.size})
            </Text>
            <Text style={styles.pantryItemsList}>
              {pantryItemNames || 'No pantry items set'}
            </Text>
            <TouchableOpacity onPress={resetToDefaults} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Reset Pantry</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    marginBottom: 16,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  yen: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3436',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#74b9ff',
    paddingVertical: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  peopleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  peopleButton1: {
    backgroundColor: '#74b9ff',
  },
  peopleButton2: {
    backgroundColor: '#a29bfe',
  },
  peopleButton4: {
    backgroundColor: '#fd79a8',
  },
  peopleButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  results: {
    flex: 1,
  },
  resultsContent: {
    paddingBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryDetails: {
    fontSize: 14,
    color: '#e8f5e9',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 6,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#2d3436',
  },
  itemQuantity: {
    fontSize: 13,
    color: '#74b9ff',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636e72',
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#b2bec3',
  },
  extraItem: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  clearAllButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  clearAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  totalCard: {
    backgroundColor: '#2d3436',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spentAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  budgetLabel: {
    fontSize: 14,
    color: '#b2bec3',
    marginTop: 4,
  },
  budgetAmount: {
    fontSize: 14,
    color: '#b2bec3',
    marginTop: 4,
  },
  peekingHippo: {
    position: 'absolute',
    bottom: 80,
    right: 10,
  },
  totalLabel: {
    fontSize: 18,
    color: '#fff',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Pantry section
  pantrySectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    marginTop: 24,
    marginBottom: 4,
  },
  pantrySubtitle: {
    fontSize: 13,
    color: '#636e72',
    marginBottom: 12,
  },
  pantryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 14,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  pantryItemInfo: {
    flex: 1,
  },
  pantryItemName: {
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '500',
  },
  pantryItemMeta: {
    fontSize: 13,
    color: '#FF8F00',
    marginTop: 2,
  },
  pantryAddButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8F00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF',
    borderRadius: 6,
    overflow: 'hidden',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#636e72',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#b2bec3',
    marginTop: 4,
    textAlign: 'center',
  },
  pantryInfo: {
    marginTop: 30,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pantryInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636e72',
    marginBottom: 8,
  },
  pantryItemsList: {
    fontSize: 13,
    color: '#b2bec3',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 14,
    color: '#636e72',
  },
});
