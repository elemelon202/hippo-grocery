import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ingredient } from '../types';

 export interface ShoppingItem {
  ingredient: Ingredient;
  checked: boolean;
}

interface ShoppingStore {
  items: ShoppingItem[];
  extras: ShoppingItem[]; // Pantry add-ons and extras
  budget: number;
  setList: (Ingredients: Ingredient[]) => void;
  setBudget: (budget: number) => void;
  toggleItem: (ingredientId: string) => void;
  addExtra: (ingredient: Ingredient) => void;
  toggleExtra: (ingredientId: string) => void;
  clearList: () => void;
}

  export const useShoppingStore = create<ShoppingStore>()(
    persist(
      (set, get) => ({
        items: [],
        extras: [],
        budget: 3000,

        setList: (ingredients) => {
          set({
            items: ingredients.map((ingredient) => ({
              ingredient,
              checked: false,
            })),
            extras: [], // Clear extras when setting new list
          });
        },

        toggleItem: (ingredientId) => {
          set({
            items: get().items.map((item) =>
              item.ingredient.id === ingredientId
                ? { ...item, checked: !item.checked }
                : item
            ),
          });
        },

        addExtra: (ingredient) => {
          const { extras } = get();
          // Don't add duplicates
          if (extras.some(e => e.ingredient.id === ingredient.id)) return;
          set({
            extras: [...extras, { ingredient, checked: true }], // Start checked
          });
        },

        toggleExtra: (ingredientId) => {
          set({
            extras: get().extras.map((item) =>
              item.ingredient.id === ingredientId
                ? { ...item, checked: !item.checked }
                : item
            ),
          });
        },

        setBudget: (budget: number) => set({ budget }),

        clearList: () => set({ items: [], extras: [] }),
      }),
      {
        name: 'shopping-storage',
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  );
