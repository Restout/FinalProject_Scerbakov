import React, { useEffect, useState } from "react";
import { ListItems } from "../../api/models/ListItems";
import { DefaultService, GroupsService } from "../../api";
import { AddList } from "../../api/models/AddList";
import { Link } from "react-router-dom";
import "./ShoppingListPage.css";

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

  const userId = localStorage.getItem("userId") || "";

  useEffect(() => {
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

    fetchShoppingLists();
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
    } catch {
      setError("Failed to add user to group. Make sure the email is correct.");
    } finally {
      setAddingUser(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const response = await GroupsService.postGroupsLeave();
      setError(response.message || "Successfully left the group.");
      setShoppingGroupsLists([]); // Clear group lists after leaving
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

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default ShoppingListsPage;
