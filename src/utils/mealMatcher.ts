import { FridgeItem, Meal, Ingredient } from "../types";
import { ingredients } from "../data/ingredients";

// Ingredient substitution groups - any item in a group can substitute for another
const SUBSTITUTION_GROUPS: string[][] = [
  // Chicken - any chicken type works for most recipes
  ['chicken-thigh', 'chicken-breast', 'chicken-wing', 'frozen-chicken-thigh', 'frozen-chicken-breast'],
  // Pork slices - koma and belly are interchangeable
  ['pork-koma', 'pork-belly', 'frozen-pork-koma'],
  // Pork loin - for katsu
  ['pork-loin'],
  // Ground meats - often interchangeable
  ['ground-pork', 'ground-chicken', 'ground-beef', 'frozen-ground-meat'],
  // Fish - salmon types
  ['salmon', 'frozen-salmon'],
  // Fish - mackerel types
  ['saba', 'frozen-saba'],
  // Shrimp
  ['ebi', 'frozen-ebi', 'frozen-ebi-large'],
  // Squid
  ['ika', 'frozen-ika'],
  // Tofu types
  ['tofu', 'atsuage'],
  // Leafy greens - interchangeable for sides
  ['hourensou', 'komatsuna', 'chingensai', 'frozen-hourensou'],
  // Cabbage types
  ['cabbage', 'hakusai'],
  // Mushrooms - often interchangeable
  ['shimeji', 'enoki', 'shiitake', 'eringi'],
  // Green onions
  ['negi', 'frozen-negi'],
  // Ginger
  ['shoga', 'frozen-ginger'],
  // Garlic
  ['ninniku', 'frozen-garlic'],
  // Broccoli
  ['broccoli', 'frozen-broccoli'],
  // Bean sprouts
  ['moyashi'],
  // Fresh udon
  ['udon-fresh', 'frozen-udon'],
];

// Build a map from ingredient ID to its substitutes
const substitutionMap = new Map<string, Set<string>>();
SUBSTITUTION_GROUPS.forEach(group => {
  const groupSet = new Set(group);
  group.forEach(id => {
    substitutionMap.set(id, groupSet);
  });
});

// Check if an available ingredient can substitute for a required one
function canSubstitute(required: string, available: Set<string>): boolean {
  // Direct match
  if (available.has(required)) return true;

  // Check substitutes
  const substitutes = substitutionMap.get(required);
  if (substitutes) {
    for (const sub of substitutes) {
      if (available.has(sub)) return true;
    }
  }
  return false;
}

// Exported version for use in other files
export function canSubstituteIngredient(required: string, available: Set<string>): boolean {
  return canSubstitute(required, available);
}

// Get all meals that can be made with current fridge + pantry (with substitutions)
export function getMakeableMeals(
  fridgeItems: FridgeItem[],
  meals: Meal[],
  pantryItems: Set<string>
): Meal[] {
  const makeable: Meal[] = [];

  // Combine fridge ingredient IDs with pantry IDs
  const fridgeIds = new Set(fridgeItems.map(item => item.ingredient.id));
  const allAvailable = new Set([...fridgeIds, ...pantryItems]);

  meals.forEach(m => {
    // Use substitution-aware matching
    if (m.requiredIngredients.every(req => canSubstitute(req, allAvailable))) {
      makeable.push(m);
    }
  });

  return makeable;
}

// Get meals that are "almost" makeable - missing only 1-2 ingredients
export function getAlmostMakeableMeals(
  fridgeItems: FridgeItem[],
  meals: Meal[],
  pantryItems: Set<string>,
  maxMissing: number = 2
): { meal: Meal; missing: string[] }[] {
  const fridgeIds = new Set(fridgeItems.map(item => item.ingredient.id));
  const allAvailable = new Set([...fridgeIds, ...pantryItems]);

  const almostMakeable: { meal: Meal; missing: string[] }[] = [];

  meals.forEach(m => {
    const missing = m.requiredIngredients.filter(req => !canSubstitute(req, allAvailable));

    // Already fully makeable or too many missing
    if (missing.length === 0 || missing.length > maxMissing) return;

    // Only show if missing fresh ingredients (not pantry staples)
    const missingFresh = missing.filter(id => {
      const ing = ingredients.find(i => i.id === id);
      return ing?.category !== 'pantry';
    });

    // If only missing pantry items, skip (suggest in pantry section instead)
    if (missingFresh.length === 0) return;

    almostMakeable.push({ meal: m, missing });
  });

  // Sort by fewest missing ingredients
  almostMakeable.sort((a, b) => a.missing.length - b.missing.length);

  return almostMakeable;
}

// Find which pantry items would unlock the most new recipes
export function getSuggestedPantryItems(
  fridgeItems: FridgeItem[],
  meals: Meal[],
  currentPantry: Set<string>,
  limit: number = 3
): { ingredient: Ingredient; unlocksCount: number }[] {
  const fridgeIds = new Set(fridgeItems.map(item => item.ingredient.id));
  const allAvailable = new Set([...fridgeIds, ...currentPantry]);

  // Find all pantry-category ingredients not yet owned
  const pantryIngredients = ingredients.filter(
    ing => ing.category === 'pantry' && !currentPantry.has(ing.id)
  );

  // For each missing pantry item, count how many new meals it would unlock
  const suggestions: { ingredient: Ingredient; unlocksCount: number }[] = [];

  for (const pantryItem of pantryIngredients) {
    const hypothetical = new Set([...allAvailable, pantryItem.id]);

    // Count meals that would become makeable
    let newlyMakeable = 0;
    for (const meal of meals) {
      // Skip if already makeable (with substitutions)
      if (meal.requiredIngredients.every(req => canSubstitute(req, allAvailable))) continue;

      // Check if this pantry item makes it makeable (with substitutions)
      if (meal.requiredIngredients.every(req => canSubstitute(req, hypothetical))) {
        newlyMakeable++;
      }
    }

    if (newlyMakeable > 0) {
      suggestions.push({ ingredient: pantryItem, unlocksCount: newlyMakeable });
    }
  }

  // Sort by most recipes unlocked, then by price (cheaper first)
  suggestions.sort((a, b) => {
    if (b.unlocksCount !== a.unlocksCount) {
      return b.unlocksCount - a.unlocksCount;
    }
    return a.ingredient.typicalPrice - b.ingredient.typicalPrice;
  });

  return suggestions.slice(0, limit);
}

// Find pantry items that are "almost" unlocking recipes
// (i.e., the recipe needs just this pantry item plus stuff already in fridge)
export function getMissingPantryForRecipes(
  fridgeItems: FridgeItem[],
  meals: Meal[],
  currentPantry: Set<string>
): Map<string, string[]> {
  const fridgeIds = new Set(fridgeItems.map(item => item.ingredient.id));
  const allAvailable = new Set([...fridgeIds, ...currentPantry]);

  // Map of pantry item ID -> meal names it would help unlock
  const wouldHelp = new Map<string, string[]>();

  for (const meal of meals) {
    // Skip already makeable meals (with substitutions)
    if (meal.requiredIngredients.every(req => canSubstitute(req, allAvailable))) continue;

    // Find what's missing (accounting for substitutions)
    const missing = meal.requiredIngredients.filter(req => !canSubstitute(req, allAvailable));

    // If only 1-2 pantry items are missing, this is a "close" recipe
    const missingPantry = missing.filter(id => {
      const ing = ingredients.find(i => i.id === id);
      return ing?.category === 'pantry';
    });

    const missingFresh = missing.filter(id => {
      const ing = ingredients.find(i => i.id === id);
      return ing?.category !== 'pantry';
    });

    // If we have all fresh ingredients but just missing 1-2 pantry items
    if (missingFresh.length === 0 && missingPantry.length <= 2) {
      for (const pantryId of missingPantry) {
        if (!wouldHelp.has(pantryId)) {
          wouldHelp.set(pantryId, []);
        }
        wouldHelp.get(pantryId)!.push(meal.name);
      }
    }
  }

  return wouldHelp;
}

// Helper to get ingredient name by ID
export function getIngredientName(id: string): string {
  const ing = ingredients.find(i => i.id === id);
  return ing ? ing.name : id;
}
