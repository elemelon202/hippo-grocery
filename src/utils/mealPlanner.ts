import { Ingredient, Meal, FridgeItem } from '../types';

// Ingredient substitution groups
const SUBSTITUTION_GROUPS: string[][] = [
  ['chicken-thigh', 'chicken-breast', 'chicken-wing', 'frozen-chicken-thigh', 'frozen-chicken-breast'],
  ['pork-koma', 'pork-belly', 'frozen-pork-koma'],
  ['ground-pork', 'ground-chicken', 'ground-beef', 'frozen-ground-meat'],
  ['salmon', 'frozen-salmon'],
  ['saba', 'frozen-saba'],
  ['ebi', 'frozen-ebi', 'frozen-ebi-large'],
  ['ika', 'frozen-ika'],
  ['tofu', 'atsuage'],
  ['hourensou', 'komatsuna', 'chingensai', 'frozen-hourensou'],
  ['cabbage', 'hakusai'],
  ['shimeji', 'enoki', 'shiitake', 'eringi'],
  ['negi', 'frozen-negi'],
  ['shoga', 'frozen-ginger'],
  ['ninniku', 'frozen-garlic'],
  ['broccoli', 'frozen-broccoli'],
  ['udon-fresh', 'frozen-udon'],
];

const substitutionMap = new Map<string, Set<string>>();
SUBSTITUTION_GROUPS.forEach(group => {
  const groupSet = new Set(group);
  group.forEach(id => substitutionMap.set(id, groupSet));
});

function canSubstitute(required: string, available: Set<string>): boolean {
  if (available.has(required)) return true;
  const substitutes = substitutionMap.get(required);
  if (substitutes) {
    for (const sub of substitutes) {
      if (available.has(sub)) return true;
    }
  }
  return false;
}

export interface PlannedMeal {
  meal: Meal;
  isQuickFix: boolean;
}

export interface WeekPlan {
  plannedMeals: PlannedMeal[];
  shoppingList: Ingredient[];
  totalCost: number;
  mealsPlanned: number;
}

function isNutritionComplete(meal: Meal): boolean {
  const hasProtein = meal.nutrition.protein === 'medium' || meal.nutrition.protein === 'high';
  const hasVeggies = meal.nutrition.vegetableServings >= 1;
  return hasProtein && hasVeggies;
}

// Calculate cost to make a meal cookable (what ingredients we need to buy)
function getMealCost(
  meal: Meal,
  alreadyHave: Set<string>,
  cart: Set<string>,
  ingredients: Ingredient[]
): { cost: number; needed: string[] } {
  const needed: string[] = [];
  let cost = 0;

  for (const reqId of meal.requiredIngredients) {
    // Already have it or in cart?
    if (canSubstitute(reqId, alreadyHave) || canSubstitute(reqId, cart)) {
      continue;
    }

    // Need to buy it
    const ingredient = ingredients.find(i => i.id === reqId);
    if (ingredient) {
      needed.push(reqId);
      cost += ingredient.typicalPrice;
    }
  }

  return { cost, needed };
}

// Noodle-based meal IDs that shouldn't dominate the week
const NOODLE_MEALS = new Set([
  'yakisoba', 'yaki-udon', 'kake-udon', 'kitsune-udon', 'tanuki-udon',
  'niku-udon', 'nabeyaki-udon', 'zaru-soba', 'somen', 'frozen-udon-set',
  'instant-ramen-upgrade'
]);

// Meal categories for variety
function getMealCategory(meal: Meal): string {
  if (NOODLE_MEALS.has(meal.id)) return 'noodle';
  if (meal.id.includes('don') || meal.id.includes('bowl')) return 'donburi';
  if (meal.id.includes('set') || meal.id.includes('teishoku')) return 'teishoku';
  if (meal.id.includes('nabe') || meal.id.includes('pot')) return 'nabe';
  if (meal.id.includes('curry') || meal.id.includes('stew')) return 'curry';
  if (meal.id.includes('stir') || meal.id.includes('itame')) return 'stirfry';
  return 'other';
}

// Score a meal - higher is better
function scoreMeal(
  meal: Meal,
  recentMealIds: string[],
  usedProteins: Set<string>,
  usedCategories: Map<string, number>,
  plannedMealIds: Set<string>,
  ingredients: Ingredient[]
): number {
  let score = 1000; // Base score

  // Check if this meal has REAL protein (meat/fish, not just egg/tofu)
  const mealProteins = meal.requiredIngredients.filter(id => {
    const ing = ingredients.find(i => i.id === id);
    return ing?.category === 'protein';
  });

  const hasRealProtein = mealProteins.some(id => {
    const lightProteins = ['egg', 'tofu', 'atsuage', 'aburaage', 'natto'];
    return !lightProteins.includes(id);
  });

  // STRONGLY prefer meals with real protein (meat/fish)
  if (hasRealProtein) {
    score += 600;
  }

  // Prefer nutritionally complete meals
  if (isNutritionComplete(meal)) {
    score += 300;
  }

  // Prefer high protein
  if (meal.nutrition.protein === 'high') score += 200;
  if (meal.nutrition.protein === 'medium') score += 50;

  // HEAVILY penalize low protein meals
  if (meal.nutrition.protein === 'low') score -= 800;

  // VARIETY BONUS: Reward NEW meal categories
  const category = getMealCategory(meal);
  const categoryCount = usedCategories.get(category) || 0;
  if (categoryCount === 0) {
    score += 400; // Big bonus for new category
  } else if (categoryCount === 1) {
    score -= 200; // Small penalty for 2nd of same category
  } else {
    score -= 600; // Bigger penalty for 3+ of same category
  }

  // Penalize noodle dishes - max 1 per week ideally
  if (NOODLE_MEALS.has(meal.id)) {
    const noodleCount = Array.from(plannedMealIds).filter(id => NOODLE_MEALS.has(id)).length;
    if (noodleCount >= 1) {
      score -= 1000; // Strongly discourage 2nd noodle meal
    }
  }

  // Variety - penalize recently made (from history)
  const recentIndex = recentMealIds.indexOf(meal.id);
  if (recentIndex !== -1) {
    score -= (10 - recentIndex) * 50;
  }

  // VARIETY: Strongly penalize same protein type
  for (const p of mealProteins) {
    const group = substitutionMap.get(p);
    if (group) {
      const overlapCount = Array.from(usedProteins).filter(u => group.has(u)).length;
      if (overlapCount >= 2) {
        score -= 2000; // Hard block 3rd meal with same protein
      } else if (overlapCount >= 1) {
        score -= 400; // Discourage 2nd meal with same protein
      }
    } else if (usedProteins.has(p)) {
      score -= 400;
    }
  }

  // Add some randomness to prevent same recommendations every time
  score += Math.random() * 100;

  return score;
}

export function planWeekMeals(
  budget: number,
  _peopleCount: number,
  meals: Meal[],
  ingredients: Ingredient[],
  recentMealIds: string[] = [],
  fridgeItems: FridgeItem[] = [],
  pantryItems: Set<string> = new Set()
): WeekPlan {
  // Target at least 7 meals, but keep going if budget allows
  const minMeals = 7;
  const maxMeals = 14; // Don't go crazy

  // What we already have
  const fridgeIds = new Set(fridgeItems.map(item => item.ingredient.id));
  const alreadyHave = new Set([...fridgeIds, ...pantryItems]);

  // Shopping cart and planned meals
  const cart = new Set<string>();
  let totalCost = 0;
  const plannedMeals: PlannedMeal[] = [];
  const usedProteins = new Set<string>();
  const usedCategories = new Map<string, number>();

  // Track planned meal IDs for variety checks
  const plannedMealIds = new Set<string>();

  // Keep selecting meals - aim to spend the budget!
  // Continue past minMeals if we have budget remaining
  while (plannedMeals.length < maxMeals) {
    // After hitting minimum meals, only continue if significant budget remains (>15%)
    const budgetRemaining = budget - totalCost;
    if (plannedMeals.length >= minMeals && budgetRemaining < budget * 0.15) {
      break;
    }
    let bestMeal: Meal | null = null;
    let bestScore = -Infinity;
    let bestCost = 0;
    let bestNeeded: string[] = [];

    for (const meal of meals) {
      // Skip already planned
      if (plannedMealIds.has(meal.id)) continue;

      // Calculate cost to add this meal
      const { cost, needed } = getMealCost(meal, alreadyHave, cart, ingredients);

      // Skip if over budget
      if (totalCost + cost > budget) continue;

      // Score this meal (no cost penalty - variety matters more!)
      const score = scoreMeal(meal, recentMealIds, usedProteins, usedCategories, plannedMealIds, ingredients);

      if (score > bestScore) {
        bestScore = score;
        bestMeal = meal;
        bestCost = cost;
        bestNeeded = needed;
      }
    }

    if (!bestMeal) break; // No affordable meals left

    // Add this meal
    plannedMeals.push({
      meal: bestMeal,
      isQuickFix: !isNutritionComplete(bestMeal),
    });
    plannedMealIds.add(bestMeal.id);

    // Track meal category for variety
    const category = getMealCategory(bestMeal);
    usedCategories.set(category, (usedCategories.get(category) || 0) + 1);

    // Add needed ingredients to cart
    for (const ingId of bestNeeded) {
      cart.add(ingId);
    }
    totalCost += bestCost;

    // Track proteins used for variety
    const mealProteins = bestMeal.requiredIngredients.filter(id => {
      const ing = ingredients.find(i => i.id === id);
      return ing?.category === 'protein';
    });
    mealProteins.forEach(p => usedProteins.add(p));
  }

  // Build shopping list
  const shoppingList: Ingredient[] = [];
  for (const ingId of cart) {
    const ingredient = ingredients.find(i => i.id === ingId);
    if (ingredient) {
      shoppingList.push(ingredient);
    }
  }

  // Sort: proteins first, then vegetables, then others
  shoppingList.sort((a, b) => {
    const order: Record<string, number> = { protein: 0, vegetable: 1, dairy: 2, frozen: 3, pantry: 4 };
    return (order[a.category] ?? 5) - (order[b.category] ?? 5);
  });

  return {
    plannedMeals,
    shoppingList,
    totalCost,
    mealsPlanned: plannedMeals.length,
  };
}
