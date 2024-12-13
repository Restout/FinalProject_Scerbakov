import React, { useEffect, useState } from "react";
import { ListItems } from "../../api/models/ListItems";
import { ApiError, DefaultService, GroupsService } from "../../api";
import { AddList } from "../../api/models/AddList";
import { Link } from "react-router-dom";
import "./ShoppingListPage.css";
import { Member } from "../../api/models/Member";

const ShoppingListsPage: React.FC = () => {
  const [shoppingLists, setShoppingLists] = useState<ListItems[]>([]);
  const [shoppingGroupLists, setShoppingGroupsLists] = useState<
    ListItems[] | undefined
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newListName, setNewListName] = useState<string>("");
  const [addingList, setAddingList] = useState<boolean>(false);
  const [searchUserEmail, setSearchUserEmail] = useState<string>("");
  const [addingUser, setAddingUser] = useState<boolean>(false);
  const [groupMembers, setGroupMembers] = useState<Member[]>([]);

  const userId = localStorage.getItem("userId") || "";

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
    } catch (e: unknown){
      if((e as ApiError).status === 400)
        setError("User is already in the group");
      else if((e as ApiError).status === 404)
        setError("User not found, make sure the email is correct")
    } finally {
      setAddingUser(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const response = await GroupsService.postGroupsLeave();
      setError("Successfully left the group.");
      setShoppingGroupsLists([]);
      setGroupMembers([]);
    } catch {
      setError("Failed to leave group.");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="shopping-lists-container">
      <h1>Shopping Lists</h1>
      {shoppingLists.length === 0 ? (
        <p>No shopping lists found.</p>
      ) : (
        <ul>
          {shoppingLists.map((list) => (
            <li key={list._id}>
              <h2>
                <Link to={`/shopping-list/${list._id}`}>{list.name}</Link>
              </h2>
            </li>
          ))}
        </ul>
      )}

      <div>
        <input
          className="input"
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="Enter new shopping list name"
        />
        <button onClick={handleAddList} disabled={addingList}>
          {addingList ? "Adding..." : "Add List"}
        </button>
      </div>

      <h1>Shopping Group Lists</h1>
      {!shoppingGroupLists || shoppingGroupLists.length === 0 ? (
        <p>No shopping lists found.</p>
      ) : (
        <ul>
          {shoppingGroupLists.map((list) => (
            <li key={list._id}>
              <h2>
                <Link to={`/shopping-list/${list._id}`}>{list.name}</Link>
              </h2>
            </li>
          ))}
        </ul>
      )}

      <div className="shopping-lists-row">
        <input
          type="text"
          value={searchUserEmail}
          onChange={(e) => setSearchUserEmail(e.target.value)}
          placeholder="user email to add"
        />
        <div className="buttons-container">
          <button onClick={handleAddUserToGroup} disabled={addingUser}>
            {addingUser ? "Adding..." : "Add"}
          </button>
          <button className="leave-button" onClick={handleLeaveGroup}>
            Leave
          </button>
        </div>
      </div>

      <h1>Group Members</h1>
      {groupMembers.length === 0 ? (
        <p>No members in the group.</p>
      ) : (
        <div style={{color: 'black'}}>
          {groupMembers.map((member) => (
            <div key={member._id}>
              <strong>{member.name}</strong> ({member.email})
            </div>
          ))}
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default ShoppingListsPage;
