import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FridgeItem, Ingredient } from '../types';
import { ingredients } from '../data/ingredients';
import AddItemModal from '../components/AddItemModal';
import { useFridgeStore } from '../store/fridgeStore';
import Hippo from '../components/Hippo';

export default function FridgeScreen() {
  const { fridgeItems, addItem, removeItem, clearFridge } = useFridgeStore();
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddItem = (ingredient: Ingredient) => {
    addItem(ingredient);
  };

  const handleRemoveItem = (ingredientId: string) => {
    removeItem(ingredientId);
  };

  const confirmRemove = (item: FridgeItem) => {
    Alert.alert(
      'Mark as used?',
      `Remove ${item.ingredient.name} from fridge?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Used', onPress: () => handleRemoveItem(item.ingredient.id) },
      ]
    );
  };

  const confirmClear = () => {
    Alert.alert(
      'Empty fridge?',
      'Remove all items from the fridge?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Empty', style: 'destructive', onPress: clearFridge },
      ]
    );
  };

  const getDaysUntilSpoil = (item: FridgeItem): number => {
    const purchaseDate = new Date(item.purchaseDate)
    const daysSincePurchase = Math.floor(
      (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return item.ingredient.spoilageDays - daysSincePurchase;
  };

  const getUrgencyColor = (daysLeft: number): string => {
    if (daysLeft <= 1) return '#e74c3c';
    if (daysLeft <= 3) return '#f39c12';
    return '#27ae60';
  };

  const renderItem = ({ item }: { item: FridgeItem }) => {
    const daysLeft = getDaysUntilSpoil(item);

    return (
      <TouchableOpacity onLongPress={() => confirmRemove(item)} delayLongPress={500}>
        <View style={styles.item}>
          <View style={[styles.urgencyDot, { backgroundColor: getUrgencyColor(daysLeft) }]} />
          <View style={styles.itemText}>
            <Text style={styles.itemName}>{item.ingredient.name}</Text>
            <Text style={styles.itemSub}>{item.ingredient.nameEn} • {item.servingsRemaining ?? item.ingredient.servings} servings</Text>
          </View>
          <Text style={styles.daysLeft}>
            {daysLeft <= 0 ? '!' : `${daysLeft}d`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
        <Text style={styles.title}>冷蔵庫</Text>
        <Text style={styles.subtitle}>Fridge</Text>

        {fridgeItems.length === 0 ? (
          <View style={styles.empty}>
            <Hippo mode="sleeping" size={100} />
            <Text style={styles.emptyText}>Your fridge is empty!</Text>
            <Text style={styles.emptySubtext}>Tap below to add ingredients</Text>
          </View>
        ) : (
          <FlatList
            data={fridgeItems.sort((a, b) => getDaysUntilSpoil(a) - getDaysUntilSpoil(b))}
            renderItem={renderItem}
            keyExtractor={(item) => item.ingredient.id}
            style={styles.list}
          />
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.clearButton} onPress={confirmClear}>
            <Text style={styles.clearButtonText}>Empty Fridge</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>
        </View>

      <AddItemModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddItem}
      />
    </View>
    );
  }

    const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#faf9f7',
      paddingTop: 60,
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#2d3436',
    },
    subtitle: {
      fontSize: 16,
      color: '#636e72',
      marginBottom: 20,
    },
    list: {
      flex: 1,
    },
    empty: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 18,
      color: '#636e72',
    },
    emptySubtext: {
      fontSize: 14,
      color: '#b2bec3',
      marginTop: 4,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 12,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    urgencyDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 12,
    },
    itemText: {
      flex: 1,
    },
    itemName: {
      fontSize: 18,
      fontWeight: '500',
      color: '#2d3436',
    },
    itemSub: {
      fontSize: 14,
      color: '#636e72',
    },
    daysLeft: {
      fontSize: 16,
      fontWeight: '600',
      color: '#636e72',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 40,
    },
    clearButton: {
      flex: 1,
      backgroundColor: '#e0e0e0',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    clearButtonText: {
      color: '#636e72',
      fontSize: 16,
      fontWeight: '600',
    },
    addButton: {
      flex: 2,
      backgroundColor: '#74b9ff',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    addButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });
