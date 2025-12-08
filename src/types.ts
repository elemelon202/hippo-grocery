export type IngredientCategory =
| 'protein'
| 'vegetable'
| 'pantry'
| 'dairy'
| 'grain' ;

export interface Ingredient {
  id: string;
  name: string;
  nameEn?: string;
  category: IngredientCategory;
  spoilageDays: number;
  rarity?: number; // for hippo store
}

export interface FridgeItem {
  ingredient: Ingredient;
  purchaseDate: Date;
  quantity?: number;
}
