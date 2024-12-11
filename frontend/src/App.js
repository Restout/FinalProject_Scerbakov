import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
  Link,
  useHistory,
} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import "./App.css";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <Router basename="/">
      <div className="container">
        <Switch>
          <Route path="/login">
            {token ? <Redirect to="/" /> : <Login onLogin={handleLogin} />}
          </Route>
          <Route path="/register">
            {token ? <Redirect to="/" /> : <Registration />}
          </Route>
          <Route exact path="/">
            {token ? <Home onLogout={handleLogout} token={token} /> : <Redirect to="/login" />}
          </Route>
          <Redirect to="/login" />
        </Switch>
      </div>
    </Router>
  );
}

  function Home({ onLogout, token }) {
    const [shoppingLists, setShoppingLists] = useState([]);
    const [newListName, setNewListName] = useState("");
    const [groupMembers, setGroupMembers] = useState(null); // Initially null, as the user might not be in a group
    const [newMemberEmail, setNewMemberEmail] = useState("");

    const userId = jwtDecode(token).id;

    useEffect(() => {
      fetch(`/api/shopping-lists/user/${userId}`)
        .then((res) => res.json())
        .then((data) => setShoppingLists(data))
        .catch((err) => console.error("Ошибка загрузки списков:", err));

      fetch("/api/groups/members", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Пользователь не состоит в группе");
          }
          return res.json();
        })
        .then((data) => setGroupMembers(data.members))
        .catch((err) => {
          console.warn("Ошибка загрузки членов группы:", err);
          setGroupMembers(null); // No group exists
        });
    }, [userId, token]);

    const handleAddList = () => {
      if (!newListName) return;
      fetch("/api/shopping-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newListName, userId }),
      })
        .then((res) => res.json())
        .then((newList) => {
          setShoppingLists([...shoppingLists, newList]);
          setNewListName("");
        })
        .catch((err) => console.error("Ошибка добавления списка:", err));
    };

    const handleAddMember = () => {
      if (!newMemberEmail) return;
      fetch("/api/groups/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: newMemberEmail }),
      })
        .then((res) => res.json())
        .then((data) => {
          setGroupMembers(data.group.members);
          setNewMemberEmail("");
        })
        .catch((err) => console.error("Ошибка добавления пользователя в группу:", err));
    };

    const handleLeaveGroup = () => {
      fetch("/api/groups/leave", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(() => {
          setGroupMembers(null); // User leaves group, no members
          setShoppingLists([]); // Clear shopping lists (assuming they are tied to the group)
        })
        .catch((err) => console.error("Ошибка выхода из группы:", err));
    };

    return (
      <div className="home">
        <h1>Мои списки покупок</h1>
        <button onClick={onLogout}>Выйти</button>
        <div>
          <input
            type="text"
            placeholder="Название нового списка"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
          <button onClick={handleAddList}>Добавить список продуктов</button>
        </div>
        <div className="group">
          <h2>Группа</h2>
          {groupMembers ? (
            <>
              <ul>
                {groupMembers.map((member) => (
                  <li key={member._id}>{member.name}</li>
                ))}
              </ul>
              <button onClick={handleLeaveGroup}>Выйти из группы</button>
            </>
          ) : (
            <p>Вы не состоите в группе.</p>
          )}
          <div>
            <input
              type="email"
              placeholder="Email нового участника"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
            />
            <button onClick={handleAddMember}>Добавить пользователя в группу</button>
          </div>
        </div>
        <div className="lists">
          {shoppingLists.map((list) => (
            <ShoppingList key={list._id} list={list} />
          ))}
        </div>
      </div>
    );
  }

function ShoppingList({ list }) {
  const [products, setProducts] = useState(list.items || []);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", quantity: "" });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) return;
    fetch(`/api/shopping-lists/${list._id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    })
      .then((res) => res.json())
      .then((updatedList) => {
        setProducts(updatedList.items);
        setNewProduct({ name: "", price: "", quantity: "" });
      })
      .catch((err) => console.error("Ошибка добавления продукта:", err));
  };

  return (
    <div className="shopping-list">
      <h3>{list.name}</h3>
      <ul>
        {products.map((product, index) => (
          <li key={index}>
            {product.name} - {product.price} ₽ - {product.quantity} шт.
          </li>
        ))}
      </ul>
      <div className="add-product">
        <input
          type="text"
          placeholder="Название продукта"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Цена"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
        />
        <input
          type="number"
          placeholder="Количество"
          value={newProduct.quantity}
          onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
        />
        <button onClick={handleAddProduct}>Добавить!</button>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        onLogin(data.token);
        history.push("/");
      } else {
        setMessage(data.message || "Ошибка входа");
      }
    } catch (err) {
      setMessage("Сетевая ошибка. Попробуйте позже.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Войти</button>
      </form>
      {message && <p>{message}</p>}
      <p>
        Нет аккаунта? <Link to="/register">Регистрация</Link>
      </p>
    </div>
  );
}

// Компонент регистрации пользователя
function Registration() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    console.log("Начата регистрация пользователя с email:", email);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Регистрация успешна.");
        setMessage("Регистрация успешна! Переход на страницу входа...");
        setTimeout(() => history.push("/login"), 2000);
      } else {
        console.log("Ошибка регистрации:", data.message);
        setMessage(data.message || "Ошибка регистрации");
      }
    } catch (err) {
      console.error("Ошибка сети при регистрации:", err);
      setMessage("Сетевая ошибка. Попробуйте позже.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Зарегистрироваться</button>
      </form>
      {message && <p>{message}</p>}
      <p>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
}
