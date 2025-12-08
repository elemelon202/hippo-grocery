  import React, { useState } from 'react';
  import {
    View,
    Text,
    Modal,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
  } from 'react-native';
  import { Ingredient } from '../types';
  import { ingredients } from '../data/ingredients';

  interface Props {
    visible: boolean;
    onClose: () => void;
    onAdd: (ingredient: Ingredient) => void;
  }

  export default function AddItemModal({ visible, onClose, onAdd }: Props) {
    const [search, setSearch] = useState('');

    const filtered = ingredients.filter(
      (ing) =>
        ing.name.includes(search) ||
        ing.nameEn?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = (ingredient: Ingredient) => {
      onAdd(ingredient);
      setSearch('');
      onClose();
    };

    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add to Fridge</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search... / 検索"
            value={search}
            onChangeText={setSearch}
          />

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item} onPress={() => handleAdd(item)}>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSub}>{item.nameEn}</Text>
                </View>
                <Text style={styles.category}>{item.category}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#faf9f7',
      paddingTop: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2d3436',
    },
    closeButton: {
      fontSize: 16,
      color: '#74b9ff',
    },
    searchInput: {
      backgroundColor: '#fff',
      marginHorizontal: 20,
      padding: 12,
      borderRadius: 10,
      fontSize: 16,
      marginBottom: 16,
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#fff',
      marginHorizontal: 20,
      padding: 16,
      borderRadius: 10,
      marginBottom: 8,
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
    category: {
      fontSize: 12,
      color: '#b2bec3',
      textTransform: 'uppercase',
    },
  });
