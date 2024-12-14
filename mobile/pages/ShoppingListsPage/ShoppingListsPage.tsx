import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, TouchableOpacity, FlatList } from "react-native";
import { ListItems } from "../../api/models/ListItems";
import { ApiError, DefaultService, GroupsService } from "../../api";
import { AddList } from "../../api/models/AddList";
import { Member } from "../../api/models/Member";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const ShoppingListsPage: React.FC = () => {
  const [shoppingLists, setShoppingLists] = useState<ListItems[]>([]);
  const [shoppingGroupLists, setShoppingGroupsLists] = useState<ListItems[] | undefined>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newListName, setNewListName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [addingList, setAddingList] = useState<boolean>(false);
  const [searchUserEmail, setSearchUserEmail] = useState<string>("");
  const [addingUser, setAddingUser] = useState<boolean>(false);
  const [groupMembers, setGroupMembers] = useState<Member[]>([]);
  const navigation = useNavigation();

  const handlePress = (id) => {
    navigation.navigate("ShoppingListDetail", { id });
  };


  useEffect(() => {
      fetchUserId();
  }, []);

  const fetchUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      setUserId(userId);
    } catch {
      setError("Failed fetch user id");
    } 
  }

  const fetchGroupMembers = async () => {
    try {
      const response = await GroupsService.getGroupsMembers(userId);
      setGroupMembers(response.members || []);
    } catch (e: unknown) {
      if ((e as ApiError).status === 404) {
        setError("The user is not part of any group.");
      } else {
        setError("Failed to load group members.");
      }
    }
  };

  const fetchShoppingLists = async () => {
    try {
      const lists = await GroupsService.getGroupsLists(userId);
      setShoppingLists(lists.userLists);
      setShoppingGroupsLists(lists.groupLists);
    } catch {
      setError("Failed to load shopping lists.");
    } finally {
      setLoading(false);
      setError("");
    }
  };

  useEffect(() => {
    fetchShoppingLists();
    fetchGroupMembers();
  }, [userId]);

  const handleAddList = async () => {
    if (!newListName.trim()) return;

    setAddingList(true);
    try {
      const newList: AddList = {
        name: newListName,
        userId: userId,
      };

      const createdList = await DefaultService.postShoppingLists(newList);
      setShoppingLists((prev) => [...prev, { ...createdList, items: [] }]);
      setNewListName("");
    } catch {
      setError("Failed to create shopping list.");
    } finally {
      setAddingList(false);
    }
  };

  const handleAddUserToGroup = async () => {
    if (!searchUserEmail.trim()) return;

    setAddingUser(true);
    try {
      const response = await GroupsService.postGroupsAdd({
        email: searchUserEmail,
      });
      setError(response.message || "User added successfully.");
      setSearchUserEmail("");
      fetchGroupMembers();
      fetchShoppingLists();
    } catch (e: unknown) {
      if ((e as ApiError).status === 400) setError("User is already in the group");
      else if ((e as ApiError).status === 404) setError("User not found, make sure the email is correct");
    } finally {
      setAddingUser(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await GroupsService.postGroupsLeave();
      setError("Successfully left the group.");
      setShoppingGroupsLists([]);
      setGroupMembers([]);
    } catch {
      setError("Failed to leave group.");
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={{ padding: 20, backgroundColor: '#f9f9f9' }}>
      <Text style={{ fontSize: 24, marginBottom: 20, textAlign: 'center' }}>Shopping Lists</Text>

      {shoppingLists.length === 0 ? (
        <Text>No shopping lists found.</Text>
      ) : (
        <FlatList
          data={shoppingLists}
          renderItem={({ item }) => (
            <View key={item._id} style={{ marginBottom: 10, backgroundColor: '#fff', padding: 15, borderRadius: 8 }}>
              <TouchableOpacity onPress={() => handlePress(item._id)}>
                <Text style={{ fontSize: 18, color: '#007bff', textAlign: 'center' }}>{item.name}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={{ marginVertical: 20 }}>
        <TextInput
          style={{marginBottom: 10, padding: 10, fontSize: 16, borderColor: '#ccc', borderWidth: 1, borderRadius: 4}}
          value={newListName}
          onChangeText={setNewListName}
          placeholder="Enter new shopping list name"
          placeholderTextColor="#999"
        />
        <Button title={addingList ? "Adding..." : "Add List"} onPress={handleAddList} disabled={addingList} />
      </View>

      <Text style={{ fontSize: 24, marginBottom: 20, textAlign: 'center' }}>Shopping Group Lists</Text>

      {!shoppingGroupLists || shoppingGroupLists.length === 0 ? (
        <Text>No shopping lists found.</Text>
      ) : (
        <FlatList
          data={shoppingGroupLists}
          renderItem={({ item }) => (
            <View key={item._id} style={{ marginBottom: 10, backgroundColor: '#fff', padding: 15, borderRadius: 8 }}>
              <TouchableOpacity onPress={() => handlePress(item._id)}>
                <Text style={{ fontSize: 18, color: '#007bff', textAlign: 'center' }}>{item.name}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={{ flexDirection: 'row', marginVertical: 20 }}>
        <TextInput
          style={{ flex: 1, padding: 10, fontSize: 16, borderColor: '#ccc', borderWidth: 1, borderRadius: 4, marginRight: 10 }}
          value={searchUserEmail}
          onChangeText={setSearchUserEmail}
          placeholder="User email to add"
          placeholderTextColor="#999"
        />
        <Button title={addingUser ? "Adding..." : "Add"} onPress={handleAddUserToGroup} disabled={addingUser} />
      </View>

      <Button title="Leave Group" onPress={handleLeaveGroup} />

      <Text style={{ fontSize: 24, marginBottom: 20, marginTop: 20, textAlign: 'center' }}>Group Members</Text>
      {groupMembers.length === 0 ? (
        <Text>No members in the group.</Text>
      ) : (
        <View>
          {groupMembers.map((member) => (
            <View key={member._id} style={{ marginBottom: 10 }}>
              <Text>{member.name} ({member.email})</Text>
            </View>
          ))}
        </View>
      )}

      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
};

export default ShoppingListsPage;
