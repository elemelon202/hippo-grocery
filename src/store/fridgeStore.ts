import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FridgeItem, Ingredient } from '../types';

  interface FridgeStore {
    fridgeItems: FridgeItem[];
    addItem: (ingredient: Ingredient) => void;
    removeItem: (ingredientId: string) => void;
  }

  export const useFridgeStore = create<FridgeStore>()(
    persist(
      (set, get) => ({
        fridgeItems: [],

        addItem: (ingredient) => {
          const { fridgeItems } = get();
          // Don't add duplicates
          if (fridgeItems.some((item) => item.ingredient.id === ingredient.id)) {
            return;
          }
          set({
            fridgeItems: [...fridgeItems, { ingredient, purchaseDate: new Date() }],
          });
        },

        removeItem: (ingredientId) => {
          set({
            fridgeItems: get().fridgeItems.filter(
              (item) => item.ingredient.id !== ingredientId
            ),
          });
        },
      }),
      {
        name: 'fridge-storage', // key in AsyncStorage
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  );
