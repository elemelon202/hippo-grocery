import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRestaurantStore } from '../store/restaurantStore';
import { UpgradeType } from '../types';
import Hippo, { HippoMode } from '../components/Hippo';

export default function StoreScreen() {
  const {
    coins,
    menuItems,
    speedLevel,
    valueLevel,
    capacityLevel,
    stats,
    tick,
    purchaseUpgrade,
    getUpgradeCost,
    getMaxCapacity,
    getSaleInterval,
    getValueMultiplier,
  } = useRestaurantStore();

  const [hippoMode, setHippoMode] = useState<HippoMode>('waiting');
  const [lastSale, setLastSale] = useState<{ count: number; coins: number } | null>(null);

  // Tick on focus and periodically
  useFocusEffect(
    useCallback(() => {
      // Initial tick when screen comes into focus
      const result = tick();
      if (result.soldCount > 0) {
        setLastSale(result);
        setHippoMode('cheering');
        setTimeout(() => setHippoMode(menuItems.length > 0 ? 'plating' : 'waiting'), 2000);
      }

      // Set up interval for periodic ticks
      const interval = setInterval(() => {
        const result = tick();
        if (result.soldCount > 0) {
          setLastSale(result);
          setHippoMode('cheering');
          setTimeout(() => setHippoMode(menuItems.length > 0 ? 'plating' : 'waiting'), 2000);
        }
      }, 5000);

      return () => clearInterval(interval);
    }, [tick, menuItems.length])
  );

  // Update hippo mode based on menu state
  useEffect(() => {
    if (hippoMode !== 'cheering') {
      setHippoMode(menuItems.length > 0 ? 'plating' : 'waiting');
    }
  }, [menuItems.length]);

  const handleUpgrade = (type: UpgradeType) => {
    purchaseUpgrade(type);
  };

  const totalStock = menuItems.reduce((sum, m) => sum + m.stock, 0);
  const maxCapacity = getMaxCapacity();
  const saleIntervalSec = Math.round(getSaleInterval() / 1000);

  return (
    <View style={styles.container}>
      {/* Header with coins */}
      <View style={styles.header}>
        <Text style={styles.title}>Hippo Restaurant</Text>
        <View style={styles.coinContainer}>
          <Text style={styles.coinEmoji}>&#x1FA99;</Text>
          <Text style={styles.coinAmount}>{coins.toLocaleString()}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Hippo mascot */}
        <View style={styles.hippoSection}>
          <Hippo mode={hippoMode} size={100} />
          {menuItems.length === 0 ? (
            <Text style={styles.hippoMessage}>Cook meals to stock your restaurant!</Text>
          ) : (
            <Text style={styles.hippoMessage}>
              Serving customers... ({totalStock} portions in stock)
            </Text>
          )}
          {lastSale && lastSale.soldCount > 0 && (
            <Text style={styles.saleNotice}>
              Sold {lastSale.soldCount} portion{lastSale.soldCount > 1 ? 's' : ''} for {lastSale.coins} coins!
            </Text>
          )}
        </View>

        {/* Menu items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Menu ({menuItems.length}/{maxCapacity})
          </Text>
          {menuItems.length === 0 ? (
            <View style={styles.emptyMenu}>
              <Text style={styles.emptyMenuText}>No items on menu</Text>
              <Text style={styles.emptyMenuSubtext}>Complete cooking to add meals</Text>
            </View>
          ) : (
            menuItems.map((item) => (
              <View key={item.id} style={styles.menuItem}>
                <Text style={styles.menuEmoji}>{item.mealEmoji}</Text>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuName}>{item.mealNameJp}</Text>
                  <Text style={styles.menuSubname}>{item.mealName}</Text>
                </View>
                <View style={styles.stockBadge}>
                  <Text style={styles.stockText}>x{item.stock}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Upgrades */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upgrades</Text>

          {/* Speed upgrade */}
          <UpgradeRow
            icon="&#x26A1;"
            name="Speed"
            description={`Sell every ${saleIntervalSec}s`}
            level={speedLevel}
            maxLevel={10}
            cost={getUpgradeCost('speed')}
            coins={coins}
            onPress={() => handleUpgrade('speed')}
          />

          {/* Value upgrade */}
          <UpgradeRow
            icon="&#x1F4B0;"
            name="Value"
            description={`${Math.round(getValueMultiplier() * 100)}% coin value`}
            level={valueLevel}
            maxLevel={10}
            cost={getUpgradeCost('value')}
            coins={coins}
            onPress={() => handleUpgrade('value')}
          />

          {/* Capacity upgrade */}
          <UpgradeRow
            icon="&#x1F4E6;"
            name="Capacity"
            description={`${maxCapacity} menu slots`}
            level={capacityLevel}
            maxLevel={10}
            cost={getUpgradeCost('capacity')}
            coins={coins}
            onPress={() => handleUpgrade('capacity')}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.statsText}>
            {stats.totalMealsSold} meals sold
          </Text>
          <Text style={styles.statsDivider}>&#x2022;</Text>
          <Text style={styles.statsText}>
            {stats.totalCoinsEarned} coins earned
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Upgrade row component
function UpgradeRow({
  icon,
  name,
  description,
  level,
  maxLevel,
  cost,
  coins,
  onPress,
}: {
  icon: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  cost: number;
  coins: number;
  onPress: () => void;
}) {
  const isMaxed = level >= maxLevel;
  const canAfford = coins >= cost;

  return (
    <View style={styles.upgradeRow}>
      <Text style={styles.upgradeIcon}>{icon}</Text>
      <View style={styles.upgradeInfo}>
        <Text style={styles.upgradeName}>{name}</Text>
        <Text style={styles.upgradeDescription}>{description}</Text>
      </View>
      <Text style={styles.upgradeLevel}>Lv.{level}/{maxLevel}</Text>
      {isMaxed ? (
        <View style={[styles.upgradeButton, styles.upgradeButtonMaxed]}>
          <Text style={styles.upgradeButtonTextMaxed}>MAX</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.upgradeButton,
            !canAfford && styles.upgradeButtonDisabled,
          ]}
          onPress={onPress}
          disabled={!canAfford}
        >
          <Text style={[
            styles.upgradeButtonText,
            !canAfford && styles.upgradeButtonTextDisabled,
          ]}>
            {cost}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f7',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  coinEmoji: {
    fontSize: 18,
    marginRight: 4,
  },
  coinAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF8F00',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  hippoSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  hippoMessage: {
    marginTop: 12,
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
  },
  saleNotice: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 12,
  },
  emptyMenu: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyMenuText: {
    fontSize: 16,
    color: '#636e72',
  },
  emptyMenuSubtext: {
    fontSize: 14,
    color: '#b2bec3',
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  menuEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  menuInfo: {
    flex: 1,
  },
  menuName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  menuSubname: {
    fontSize: 13,
    color: '#636e72',
  },
  stockBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  upgradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  upgradeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  upgradeInfo: {
    flex: 1,
  },
  upgradeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  upgradeDescription: {
    fontSize: 13,
    color: '#636e72',
  },
  upgradeLevel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#74b9ff',
    marginRight: 12,
  },
  upgradeButton: {
    backgroundColor: '#FF8F00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  upgradeButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  upgradeButtonMaxed: {
    backgroundColor: '#4CAF50',
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  upgradeButtonTextDisabled: {
    color: '#999',
  },
  upgradeButtonTextMaxed: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#636e72',
  },
  statsDivider: {
    marginHorizontal: 8,
    color: '#b2bec3',
  },
});
