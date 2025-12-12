import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FridgeItem, Ingredient, Leftover } from '../types';

  interface FridgeStore {
    fridgeItems: FridgeItem[];
    leftovers: Leftover[];
    addItem: (ingredient: Ingredient) => void;
    removeItem: (ingredientId: string) => void;
    useIngredient: (ingredientId: string) => void;
    clearFridge: () => void;
    addLeftover: (leftover: Leftover) => void;
    eatLeftover: (leftoverId: string) => void;
    removeLeftover: (leftoverId: string) => void;
  }

  export const useFridgeStore = create<FridgeStore>()(
    persist(
      (set, get) => ({
        fridgeItems: [],
        leftovers: [],

        addItem: (ingredient) => {
          const { fridgeItems } = get();
          // Don't add duplicates
          if (fridgeItems.some((item) => item.ingredient.id === ingredient.id)) {
            return;
          }
          set({
            fridgeItems: [...fridgeItems, {
              ingredient,
              purchaseDate: new Date(),
              servingsRemaining: ingredient.servings
            }],
          });
        },

        removeItem: (ingredientId) => {
          set({
            fridgeItems: get().fridgeItems.filter(
              (item) => item.ingredient.id !== ingredientId
            ),
          });
        },

        useIngredient: (ingredientId) => {
          const { fridgeItems } = get();
          set({
            fridgeItems: fridgeItems
              .map((item) => {
                if (item.ingredient.id === ingredientId) {
                  const currentServings = item.servingsRemaining ?? item.ingredient.servings;
                  return { ...item, servingsRemaining: currentServings - 1 };
                }
                return item;
              })
              .filter((item) => (item.servingsRemaining ?? item.ingredient.servings) > 0),
          });
        },

        clearFridge: () => {
          set({ fridgeItems: [], leftovers: [] });
        },

        addLeftover: (leftover) => {
          set({ leftovers: [...get().leftovers, leftover] });
        },

        eatLeftover: (leftoverId) => {
          const { leftovers } = get();
          set({
            leftovers: leftovers
              .map((l) => {
                if (l.id === leftoverId) {
                  return { ...l, servingsRemaining: l.servingsRemaining - 1 };
                }
                return l;
              })
              .filter((l) => l.servingsRemaining > 0),
          });
        },

        removeLeftover: (leftoverId) => {
          set({
            leftovers: get().leftovers.filter((l) => l.id !== leftoverId),
          });
        },
      }),
      {
        name: 'fridge-storage', // key in AsyncStorage
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  );
