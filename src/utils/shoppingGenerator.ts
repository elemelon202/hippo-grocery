import { Ingredient, Meal } from '../types';
import { getMealCost } from './mealCost';

interface ShoppingResult {
  items: Ingredient[];
  totalCost: number;
  mealsEnabled: number;
}

export function generateShoppingList(ingredients: Ingredient[], meals: Meal[], budget: number): ShoppingResult {
  const sortedMeals = [...meals].sort((a, b) => {
   return getMealCost(a, ingredients) - getMealCost(b, ingredients)
  });

  const selectedIds = new Set<string>();
  let totalCost = 0;
  let mealsEnabled = 0;

  for (const meal of sortedMeals) {
    const newIngIds = meal.requiredIngredients.filter(id => !selectedIds.has(id))
    let incrementalCost = 0;
      newIngIds.forEach((ingId) => {
        const found = ingredients.find(item => item.id === ingId);
        incrementalCost += found?.typicalPrice || 0;
      });
      if ((totalCost + incrementalCost) <= budget) {
          newIngIds.forEach(id => selectedIds.add(id));
          totalCost += incrementalCost;
          mealsEnabled ++;
        }
  }
  const items = ingredients.filter(item => selectedIds.has(item.id));

  return {
    items,
    totalCost,
    mealsEnabled
  }
}
