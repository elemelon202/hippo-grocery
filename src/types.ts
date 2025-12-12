export type IngredientCategory =
| 'protein'
| 'vegetable'
| 'pantry'
| 'dairy'
| 'grain'
| 'frozen';

export interface Ingredient {
  id: string;
  name: string;
  nameEn?: string;
  category: IngredientCategory;
  spoilageDays: number;
  rarity?: number; // for hippo store
  typicalPrice: number;
  seasonality?: ("spring" | "summer" | "autumn" | "winter")[];
  servings: number;
  purchaseQuantity?: string; // e.g., "400g", "6 eggs", "1 pack"
}

export interface FridgeItem {
  ingredient: Ingredient;
  purchaseDate: Date;
  servingsRemaining: number;
}

export interface AirFryerStep {
  temperature: number;
  timeMinutes: number;
  instructions: string;
}

export interface CookingStep {
  id: string;
  order: number;
  title: string;
  titleJp: string;
  instructions: string;
  instructionsJp: string;
  durationMinutes?: number;
  airFryerStep?: AirFryerStep;
}

export interface NutritionProfile {
  protein: 'low' | 'medium' | 'high';
  vegetableServings: number;
}

export type EffortLevel = 'easy' | 'medium' | 'hard'

export interface MealComponent {
  type: 'main' | 'rice' | 'soup' | 'side';
  name: string;
  nameJp: string;
  requiredIngredients: string [];
}

// Amount of ingredient needed per serving
export interface IngredientAmount {
  ingredientId: string;
  amount: string; // e.g., "100g", "1/2", "1 piece"
}

export interface Meal {
  id: string;
  name: string;
  nameJp: string;
  imageEmoji: string;
  components: MealComponent[];
  requiredIngredients: string[];
  ingredientAmounts?: IngredientAmount[]; // amounts per 1 serving
  servingsPerRecipe?: number; // how many portions this makes (default 2)
  effort: EffortLevel;
  nutrition: NutritionProfile;
  cookingSteps: CookingStep[];
  totalTimeMinutes: number;
}

// Leftover from a cooked meal stored in fridge
export interface Leftover {
  id: string;
  mealId: string;
  mealName: string;
  mealNameJp: string;
  mealEmoji: string;
  servingsRemaining: number;
  cookedDate: Date;
}
