import { Ingredient, Meal } from '../types';

export function getMealCost(meal: Meal, ingredients: Ingredient[]): number {

  let price = 0;
  meal.requiredIngredients.forEach((ingId) => {
    const found = ingredients.find(item => item.id === ingId);
    if (found) {
      price += found.typicalPrice;
    }
  })
  return price;
}
