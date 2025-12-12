import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pantry items don't track servings or dates - they're just "have it or not"
interface PantryStore {
  pantryItems: Set<string>; // ingredient IDs
  addToPantry: (ingredientId: string) => void;
  removeFromPantry: (ingredientId: string) => void;
  hasPantryItem: (ingredientId: string) => boolean;
  clearPantry: () => void;
  resetToDefaults: () => void;
}

// Starter pantry - most Japanese kitchens have these basics
export const STARTER_PANTRY = [
  // Absolute essentials
  'shoyu',        // soy sauce
  'salt',         // salt
  'sugar',        // sugar
  'salad-oil',    // cooking oil
  'rice',         // rice
  // Common seasonings (most kitchens have these)
  'miso',         // miso (for miso soup - almost every meal has this)
  'mirin',        // mirin
  'sake',         // cooking sake
  'sesame-oil',   // sesame oil
  // Cooking basics
  'katakuriko',   // potato starch (for coating/thickening)
  'flour',        // flour
  'panko',        // panko breadcrumbs
  // Soup bases
  'hondashi',     // dashi granules
  'chicken-stock', // chicken stock powder
  // Common sauces
  'mayonnaise',   // mayo
  'ketchup',      // ketchup
  'mentsuyu',     // noodle sauce base
];

// Essential pantry items ranked by how many recipes they unlock
export const PANTRY_PRIORITY = [
  // Tier 1 - Absolute essentials
  'shoyu', 'mirin', 'sake', 'salt', 'sugar', 'salad-oil',
  // Tier 2 - Very common
  'hondashi', 'sesame-oil', 'miso', 'katakuriko',
  // Tier 3 - Expands options significantly
  'oyster-sauce', 'chicken-stock', 'mayonnaise', 'ponzu',
  // Tier 4 - Nice to have
  'mentsuyu', 'doubanjiang', 'gochujang', 'su',
];

export const usePantryStore = create<PantryStore>()(
  persist(
    (set, get) => ({
      pantryItems: new Set<string>(STARTER_PANTRY),

      addToPantry: (ingredientId) => {
        const newSet = new Set(get().pantryItems);
        newSet.add(ingredientId);
        set({ pantryItems: newSet });
      },

      removeFromPantry: (ingredientId) => {
        const newSet = new Set(get().pantryItems);
        newSet.delete(ingredientId);
        set({ pantryItems: newSet });
      },

      hasPantryItem: (ingredientId) => {
        return get().pantryItems.has(ingredientId);
      },

      clearPantry: () => {
        set({ pantryItems: new Set<string>() });
      },

      resetToDefaults: () => {
        set({ pantryItems: new Set<string>(STARTER_PANTRY) });
      },
    }),
    {
      name: 'pantry-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Custom serialization for Set
      partialize: (state) => ({
        pantryItems: Array.from(state.pantryItems),
      }),
      merge: (persisted: any, current) => ({
        ...current,
        pantryItems: new Set(persisted?.pantryItems || STARTER_PANTRY),
      }),
    }
  )
);
