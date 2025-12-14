import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuItem, RestaurantStats, UpgradeType, EffortLevel } from '../types';

// Coin values by effort level
const BASE_COINS: Record<EffortLevel, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
};

// Base costs for upgrades
const BASE_COSTS: Record<UpgradeType, number> = {
  speed: 100,
  value: 150,
  capacity: 200,
};

// Max 24 hours of offline sales
const MAX_OFFLINE_MS = 24 * 60 * 60 * 1000;

interface MealForRestaurant {
  mealId: string;
  mealName: string;
  mealNameJp: string;
  mealEmoji: string;
  effort: EffortLevel;
  servings: number;
}

interface RestaurantStore {
  // State
  coins: number;
  menuItems: MenuItem[];
  lastTickAt: number;
  speedLevel: number;
  valueLevel: number;
  capacityLevel: number;
  stats: RestaurantStats;

  // Actions
  addMealToMenu: (meal: MealForRestaurant) => void;
  tick: () => { soldCount: number; coinsEarned: number };
  purchaseUpgrade: (type: UpgradeType) => boolean;
  getUpgradeCost: (type: UpgradeType) => number;
  getMaxCapacity: () => number;
  getSaleInterval: () => number;
  getValueMultiplier: () => number;
}

export const useRestaurantStore = create<RestaurantStore>()(
  persist(
    (set, get) => ({
      coins: 0,
      menuItems: [],
      lastTickAt: Date.now(),
      speedLevel: 1,
      valueLevel: 1,
      capacityLevel: 1,
      stats: {
        totalMealsSold: 0,
        totalCoinsEarned: 0,
      },

      addMealToMenu: (meal) => {
        const { menuItems } = get();
        const maxCapacity = get().getMaxCapacity();

        // Check if this meal already exists in menu
        const existingIndex = menuItems.findIndex(m => m.mealId === meal.mealId);

        if (existingIndex >= 0) {
          // Add to existing stock
          set({
            menuItems: menuItems.map((m, i) =>
              i === existingIndex
                ? { ...m, stock: m.stock + meal.servings }
                : m
            ),
          });
        } else if (menuItems.length < maxCapacity) {
          // Add new menu item
          set({
            menuItems: [...menuItems, {
              id: `menu-${meal.mealId}-${Date.now()}`,
              mealId: meal.mealId,
              mealName: meal.mealName,
              mealNameJp: meal.mealNameJp,
              mealEmoji: meal.mealEmoji,
              effort: meal.effort,
              stock: meal.servings,
              addedAt: Date.now(),
            }],
          });
        }
        // If at capacity and meal doesn't exist, it gets dropped
        // (UI should warn user before cooking)
      },

      tick: () => {
        const { menuItems, lastTickAt, stats } = get();
        const now = Date.now();

        // Cap offline time
        const elapsed = Math.min(now - lastTickAt, MAX_OFFLINE_MS);
        const saleInterval = get().getSaleInterval();

        // How many sales could have happened?
        const potentialSales = Math.floor(elapsed / saleInterval);

        if (potentialSales === 0 || menuItems.length === 0) {
          set({ lastTickAt: now });
          return { soldCount: 0, coinsEarned: 0 };
        }

        // Count total available stock
        const totalStock = menuItems.reduce((sum, m) => sum + m.stock, 0);
        if (totalStock === 0) {
          set({ lastTickAt: now });
          return { soldCount: 0, coinsEarned: 0 };
        }

        // Distribute sales across menu items (round-robin)
        let salesRemaining = Math.min(potentialSales, totalStock);
        let totalCoins = 0;
        let updatedMenuItems = [...menuItems];
        const valueMultiplier = get().getValueMultiplier();

        let soldCount = 0;
        while (salesRemaining > 0) {
          let soldThisRound = false;
          for (let i = 0; i < updatedMenuItems.length && salesRemaining > 0; i++) {
            if (updatedMenuItems[i].stock > 0) {
              const item = updatedMenuItems[i];
              const coins = Math.floor(BASE_COINS[item.effort] * valueMultiplier);

              updatedMenuItems[i] = { ...item, stock: item.stock - 1 };
              totalCoins += coins;
              salesRemaining--;
              soldCount++;
              soldThisRound = true;
            }
          }
          if (!soldThisRound) break;
        }

        // Remove empty menu items
        updatedMenuItems = updatedMenuItems.filter(m => m.stock > 0);

        set({
          coins: get().coins + totalCoins,
          menuItems: updatedMenuItems,
          lastTickAt: now,
          stats: {
            totalMealsSold: stats.totalMealsSold + soldCount,
            totalCoinsEarned: stats.totalCoinsEarned + totalCoins,
          },
        });

        return { soldCount, coinsEarned: totalCoins };
      },

      purchaseUpgrade: (type) => {
        const cost = get().getUpgradeCost(type);
        const { coins, speedLevel, valueLevel, capacityLevel } = get();

        if (coins < cost) return false;
        if (type === 'speed' && speedLevel >= 10) return false;
        if (type === 'value' && valueLevel >= 10) return false;
        if (type === 'capacity' && capacityLevel >= 10) return false;

        set({
          coins: coins - cost,
          ...(type === 'speed' && { speedLevel: speedLevel + 1 }),
          ...(type === 'value' && { valueLevel: valueLevel + 1 }),
          ...(type === 'capacity' && { capacityLevel: capacityLevel + 1 }),
        });

        return true;
      },

      getUpgradeCost: (type) => {
        const { speedLevel, valueLevel, capacityLevel } = get();
        const currentLevel = {
          speed: speedLevel,
          value: valueLevel,
          capacity: capacityLevel,
        }[type];

        if (currentLevel >= 10) return Infinity;

        return Math.floor(BASE_COSTS[type] * Math.pow(1.5, currentLevel - 1));
      },

      getMaxCapacity: () => {
        return 3 + (get().capacityLevel - 1); // Start with 3, max of 12
      },

      getSaleInterval: () => {
        const baseSaleIntervalMs = 60000; // 60 seconds
        const speedMultiplier = 1 - (get().speedLevel - 1) * 0.08; // 8% faster per level
        return baseSaleIntervalMs * speedMultiplier;
      },

      getValueMultiplier: () => {
        return 1 + (get().valueLevel - 1) * 0.2; // 20% more per level
      },
    }),
    {
      name: 'restaurant-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
