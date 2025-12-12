import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MealHistoryStore {
  // Recent meal IDs (most recent first), kept to last 20
  recentMealIds: string[];
  addMealToHistory: (mealId: string) => void;
  clearHistory: () => void;
}

export const useMealHistoryStore = create<MealHistoryStore>()(
  persist(
    (set, get) => ({
      recentMealIds: [],

      addMealToHistory: (mealId) => {
        const { recentMealIds } = get();
        // Remove if already exists (to move to front)
        const filtered = recentMealIds.filter(id => id !== mealId);
        // Add to front, keep only last 20
        const updated = [mealId, ...filtered].slice(0, 20);
        set({ recentMealIds: updated });
      },

      clearHistory: () => {
        set({ recentMealIds: [] });
      },
    }),
    {
      name: 'meal-history-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
