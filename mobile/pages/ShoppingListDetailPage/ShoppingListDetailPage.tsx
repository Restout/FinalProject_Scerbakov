import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, FlatList } from "react-native";
import { DefaultService } from "../../api";
import { useNavigation, useRoute } from "@react-navigation/native";

const ShoppingListDetailPage = () => {
  const route = useRoute();
  const { id } = route.params || {};
  const [shoppingList, setShoppingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState({ name: "", quantity: 0, price: 0 });
  const navigation = useNavigation();

  useEffect(() => {
    const fetchShoppingListDetail = async () => {
      try {
        if (id) {
          const list = await DefaultService.getShoppingListItems(id);
          setShoppingList(list);
        }
      } catch {
        setError("Failed to load shopping list details.");
      } finally {
        setLoading(false);
      }
    };

    fetchShoppingListDetail();
  }, [id]);

  const handleAddItem = async () => {
    if (shoppingList && id) {
      try {
        const updatedList = await DefaultService.postShoppingListsItems(id, newItem);
        setShoppingList(updatedList);
        setNewItem({ name: "", quantity: 0, price: 0 });
      } catch {
        setError("Failed to add item.");
      }
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (shoppingList) {
      try {
        await DefaultService.deleteItems(itemId);
        setShoppingList((prevList) => ({
          ...prevList,
          items: prevList.items.filter((item) => item._id !== itemId),
        }));
      } catch {
        setError("Failed to delete item.");
      }
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!shoppingList) {
    return <Text>Shopping list not found.</Text>;
  }

  return (
    <View style={styles.container}>
        <Text style={styles.title}>{shoppingList.name}</Text>

      <FlatList
        data={shoppingList.items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>
              <Text style={styles.itemName}>{item.name}</Text> {item.quantity} x {item.price}$
            </Text>
            <Button title="Delete" onPress={() => handleDeleteItem(item._id)} />
          </View>
        )}
      />

      <Text style={styles.addItemHeader}>Add New Item</Text>
      <TextInput
        style={styles.input}
        placeholder="Item Name"
        value={newItem.name}
        onChangeText={(text) => setNewItem({ ...newItem, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantity"
        value={newItem.quantity.toString()}
        onChangeText={(text) => setNewItem({ ...newItem, quantity: parseInt(text) })}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={newItem.price.toString()}
        onChangeText={(text) => setNewItem({ ...newItem, price: parseFloat(text) })}
        keyboardType="numeric"
      />
      <Button title="Add Item" onPress={handleAddItem} />

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center'
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  itemName: {
    fontWeight: "bold",
  },
  addItemHeader: {
    fontSize: 18,
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
});

export default ShoppingListDetailPage;
