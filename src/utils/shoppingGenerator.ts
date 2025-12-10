import { Ingredient } from '../types';

interface ShoppingResult {
  items: Ingredient[];
  totalCost: number;
  totalServings: number;
}

export function generateShoppingList(ingredients: Ingredient[], budget: number, targetMeals: number = 7,): ShoppingResult {
  const sorted = [...ingredients].sort((a, b) => {
    const efficiencyA = a.servings / a.typicalPrice;
    const efficiencyB = b.servings / b.typicalPrice;
    return efficiencyB - efficiencyA
  });

  const selected: Ingredient[] = [];
  let totalCost = 0;
  let proteinServings = 0;
  let veggieServings = 0;

  for (const item of sorted) {
    if (item.category === 'protein' && totalCost + item.typicalPrice <= budget) {
      selected.push(item);
      totalCost += item.typicalPrice;
      proteinServings += item.servings;
      if (proteinServings >= targetMeals) break;
    }
  }

  for (const item of sorted) {
    if (item.category === 'vegetable' && totalCost + item.typicalPrice <= budget) {
      selected.push(item);
      totalCost += item.typicalPrice;
      veggieServings += item.servings;
    }
  }

  for (const item of sorted) {
    if (!selected.includes(item) && totalCost + item.typicalPrice <= budget) {
      selected.push(item);
      totalCost += item.typicalPrice;
    }
  }

  return {
    items: selected,
    totalCost,
    totalServings: selected.reduce((sum, item) => sum + item.servings, 0),
  };
}
