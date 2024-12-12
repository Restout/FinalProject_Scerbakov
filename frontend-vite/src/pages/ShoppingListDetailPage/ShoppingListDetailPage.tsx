import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ListItems } from "../../api/models/ListItems";
import { Item } from "../../api/models/Item";
import { DefaultService } from "../../api";
import './ShoppingListDetailPage.css'

const ShoppingListDetailPage = () => {
  const { id } = useParams();
  const [shoppingList, setShoppingList] = useState<ListItems | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Item>({
    name: ""
  });
  const navigate = useNavigate();

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

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (shoppingList && id) {
      try {
        const updatedList = await DefaultService.postShoppingListsItems(
          id,
          newItem
        );
        setShoppingList(updatedList); 
        setNewItem({ name: ""}); 
      } catch {
        setError("Failed to add item.");
      }
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (shoppingList) {
      try {
        await DefaultService.deleteItems(itemId);
        setShoppingList((prevList) => ({
          ...prevList!,
          items: prevList!.items?.filter((item) => item._id !== itemId),
        }));
      } catch {
        setError("Failed to delete item.");
      }
    }
  };

  const handleReturnBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!shoppingList) {
    return <div>Shopping list not found.</div>;
  }

  return (
    <div className="shopping-list-detail-container">
      <h1>
        <button onClick={handleReturnBack}>Back</button> 
        {shoppingList.name}
      </h1>

      <ul>
        {shoppingList.items?.map((item) => (
          <>
            <li key={item._id}>
              <strong>{item.name}</strong>{item.quantity} x {item.price}$
              <button onClick={() => handleDeleteItem(item._id!)}>
                Delete
              </button>
            </li>
            <br></br>
          </>
        ))}
      </ul>

      <h2>Add New Item</h2>
      <form onSubmit={handleAddItem}>
        <input
          type="text"
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newItem.quantity}
          onChange={(e) =>
            setNewItem({ ...newItem, quantity: Number(e.target.value) })
          }
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={newItem.price}
          onChange={(e) =>
            setNewItem({ ...newItem, price: Number(e.target.value) })
          }
          required
        />
        <button type="submit">Add Item</button>
      </form>
      <div className="error">{error}</div>
    </div>
  );
};

export default ShoppingListDetailPage;
