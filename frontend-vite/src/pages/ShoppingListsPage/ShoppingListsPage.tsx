import React, { useEffect, useState } from 'react';
import { ListItems } from '../../api/models/ListItems';
import { DefaultService } from '../../api';
import { AddList } from '../../api/models/AddList';
import { Link } from 'react-router-dom';
import './ShoppingListPage.css';

const ShoppingListsPage: React.FC = () => {
    const [shoppingLists, setShoppingLists] = useState<ListItems[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [newListName, setNewListName] = useState<string>('');
    const [addingList, setAddingList] = useState<boolean>(false);

    const userId = localStorage.getItem('userId') || ''; 

    useEffect(() => {
        const fetchShoppingLists = async () => {
            try {
                const lists = await DefaultService.getShoppingListsUser(userId);
                setShoppingLists(lists);
            } catch {
                setError('Failed to load shopping lists.');
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
            setNewListName(''); 
        } catch {
            setError('Failed to create shopping list.');
        } finally {
            setAddingList(false);
        }
    };

    if (loading) {
        return <div className='loading'>Loading...</div>;
    }

    if (error) {
        return <div className='error'>{error}</div>;
    }

    return (
        <div className='shopping-lists-container'>
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
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Enter new shopping list name"
                />
                <button onClick={handleAddList} disabled={addingList}>
                    {addingList ? 'Adding...' : 'Add List'}
                </button>
            </div>
        </div>
    );
};

export default ShoppingListsPage;
