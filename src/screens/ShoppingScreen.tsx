  import React, { useState } from 'react';
  import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
  import { ingredients } from '../data/ingredients';
  import { generateShoppingList } from '../utils/shoppingGenerator';
  import { Ingredient } from '../types';
  import { useShoppingStore } from '../store/shoppingListStore';

  export default function ShoppingScreen() {
    const { items, budget, setList, toggleItem, setBudget } = useShoppingStore()
    const [totalCost, setTotalCost] = useState(0);

    const handleGenerate = () => {
      const result = generateShoppingList(ingredients, budget);
      setList(result.items);
      setTotalCost(result.totalCost);
    };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>買い物リスト</Text>
        <Text style={styles.subtitle}>Shopping List</Text>

        <View style={styles.budgetRow}>
          <Text style={styles.yen}>¥</Text>
          <TextInput
          style={styles.input}
          value={String(budget)}
          onChangeText={(text) => setBudget(parseInt(text) || 0)}
          keyboardType="number-pad"
          placeholder={"3000"}
          />
          <TouchableOpacity style={styles.button} onPress={handleGenerate}>
            <Text style ={styles.buttonText}>Generate</Text>
          </TouchableOpacity>
        </View>

        {items.length > 0 && (
          <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.ingredient.id}
            renderItem={({item}) => (
               <TouchableOpacity onPress={() => toggleItem(item.ingredient.id)}>
                  <View style={styles.item}>
                    <Text style={[
                      styles.itemName,
                      item.checked && styles.checkedText
                    ]}>
                      {item.ingredient.name}
                    </Text>
                    <Text style={styles.itemPrice}>¥{item.ingredient.typicalPrice}</Text>
                  </View>
                </TouchableOpacity>
            )}
            style={styles.list}
          />
          <Text style={styles.total}>Total: ¥{totalCost}</Text>
          </>
        )}
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
    budgetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    yen: {
      fontSize: 24,
      color: '#2d3436',
      marginRight: 4,
    },
    input: {
      flex: 1,
      fontSize: 24,
      borderBottomWidth: 2,
      borderBottomColor: '#74b9ff',
      paddingVertical: 8,
      marginRight: 12,
    },
    button: {
      backgroundColor: '#74b9ff',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
    },
    list: {
      flex: 1,
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    itemName: {
      fontSize: 16,
      color: '#2d3436',
    },
    itemPrice: {
      fontSize: 16,
      color: '#636e72',
    },
    total: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'right',
      marginVertical: 20,
      color: '#2d3436',
    },
     checkedText: {
    textDecorationLine: 'line-through',
    color: '#b2bec3',
  },
  });
