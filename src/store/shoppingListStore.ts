import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ingredient } from '../types';

interface ShoppingItem {
  ingredient: Ingredient;
  checked: boolean;
}

interface ShoppingStore {
  items: ShoppingItem[];
  budget: number;
  setList: (Ingredients: Ingredient[]) => void;
  setBudget: (budget: number) => void;
  toggleItem: (ingredientId: string) => void;
}

  export const useShoppingStore = create<ShoppingStore>()(
    persist(
      (set, get) => ({
        items: [],
        budget: 3000,

        setList: (ingredients) => {
          set({
            items: ingredients.map((ingredient) => ({
              ingredient,
              checked: false,
            })),
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

        setBudget: (budget: number) => set({ budget }),

        clearList: () => set({ items: [] }),
      }),
      {
        name: 'shopping-storage',
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  );
