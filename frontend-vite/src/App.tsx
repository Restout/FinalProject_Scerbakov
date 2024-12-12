import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css'
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ShoppingListDetailPage from './pages/ShoppingListDetailPage/ShoppingListDetailPage';
import ShoppingListsPage from './pages/ShoppingListsPage/ShoppingListsPage';

function App() {

  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<ShoppingListsPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/shopping-list/:id" element={<ShoppingListDetailPage />} />
        </Routes>
    </BrowserRouter>
);
}

export default App
