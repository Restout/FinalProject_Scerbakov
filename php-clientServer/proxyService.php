<?php

// Старт сессии для хранения токена
session_start();

// Основной API для взаимодействия
define('API_URL', 'http://localhost:3000/api');

// Функция для отправки POST запроса к API

// Получаем метод запроса (POST)
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Получаем тело запроса как JSON

function sendPostRequest($url, $data)
{
    $ch = curl_init($url);

    $token = isset($_SESSION['token']) ? $_SESSION['token'] : '';

    // Настройки cURL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token,
    ]);
    // Выполнение запроса и получение ответа
    $response = curl_exec($ch);
    echo $response;

    // Проверка на ошибку
    if (curl_errno($ch)) {
        echo json_encode(['error' => 'cURL Error: ' . curl_error($ch)]);
        exit;
    }
    curl_close($ch);

    // Возвращаем ответ
    return json_decode($response, true);
}

function sendGetRequest($url)
{
    $ch = curl_init($url);

    echo urldecode($url);

    // Получаем токен из сессии
    $token = isset($_SESSION['token']) ? $_SESSION['token'] : '';

    // Настройки cURL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,  // Добавляем токен в заголовок
    ]);
    // Выполнение запроса и получение ответа
    $response = curl_exec($ch);
    echo $response;

    // Проверка на ошибку
    if (curl_errno($ch)) {
        echo json_encode(['error' => 'cURL Error: ' . curl_error($ch)]);
        exit;
    }
    curl_close($ch);
    // Возвращаем ответ
    return json_decode($response, true);
}

// Функция для отправки DELETE запроса к API
function sendDeleteRequest($url)
{
    $ch = curl_init($url);

    // Получаем токен из сессии
    $token = isset($_SESSION['token']) ? $_SESSION['token'] : '';

    // Настройки cURL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");  // Устанавливаем метод DELETE
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,  // Добавляем токен в заголовок
    ]);

    // Выполнение запроса и получение ответа
    $response = curl_exec($ch);

    // Проверка на ошибку
    if (curl_errno($ch)) {
        echo json_encode(['error' => 'cURL Error: ' . curl_error($ch)]);
        exit;
    }
    curl_close($ch);

    // Возвращаем ответ
    return json_decode($response, true);
}

// Функция для получения данных из запроса
function getRequestData()
{
    // Проверяем тип контента
    $contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';

    if (strpos($contentType, 'application/json') !== false) {
        // Если контент JSON, читаем его из php://input
        $inputData = json_decode(file_get_contents('php://input'), true);
        return $inputData;
    } else if (strpos($contentType, 'application/x-www-form-urlencoded') !== false) {
        // Если контент форма, данные в $_POST
        return $_POST;
    } else {
        return null;  // Неподдерживаемый тип контента
    }
}

// Обработчик регистрации
if ($_SERVER['REQUEST_URI'] === '/register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputData = getRequestData();

    if (!isset($inputData['name'], $inputData['email'], $inputData['password'])) {
        echo json_encode(['error' => 'Missing required fields']);
        exit();
    } else {
        echo $inputData['name'];
        echo $inputData['email'];
        echo $inputData['password'];

        $response = sendPostRequest(API_URL . '/auth/register', $inputData);

        echo $response['message'];
        if (isset($response['message']) && $response['message'] === 'User registered successfully') {
            // Переходим к странице входа после успешной регистрации
            echo '<h1>Registration Successful</h1>';
            echo '<a href="/login">Go to Login</a>';
        } else {
            echo '<h1>Error: ' . $response['message'] . '</h1>';
        }
    }
}

// Обработчик входа
if ($_SERVER['REQUEST_URI'] === '/login' && $_SERVER['REQUEST_METHOD'] === 'POST') {

    $inputData = getRequestData();
    if (!isset($inputData['email'], $inputData['password'])) {
        echo json_encode(['error' => 'Missing required fields']);
        exit();
    } else {

        $response = sendPostRequest(API_URL . '/auth/login', $inputData);

        if (isset($response['token'])) {
            // Сохраняем токен в сессии
            $_SESSION['token'] = $response['token'];
            echo '<h1>Login Successful</h1>';
            echo '<p>Your token: ' . htmlspecialchars($response['token']) . '</p>';
        } else {
            echo '<h1>Error: ' . $response['message'] . '</h1>';
        }
    }
}

// Простая HTML форма для регистрации
if ($_SERVER['REQUEST_URI'] === '/register' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    echo '<h1>Register</h1>';
    echo '<form method="POST" action="/register">
            Name: <input type="text" name="name" required><br>
            Email: <input type="email" name="email" required><br>
            Password: <input type="password" name="password" required><br>
            <button type="submit">Register</button>
          </form>';
}

// Простая HTML форма для входа
if ($_SERVER['REQUEST_URI'] === '/login' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    echo '<h1>Login</h1>';
    echo '<form method="POST" action="/login">
            Email: <input type="email" name="email" required><br>
            Password: <input type="password" name="password" required><br>
            <button type="submit">Login</button>
          </form>';
}

// Обработчик для создания нового списка покупок (POST /shopping-lists)
if ($_SERVER['REQUEST_URI'] === '/shopping-lists' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputData = getRequestData();
    if (!isset($inputData['name'], $inputData['userId'])) {
        echo json_encode(['error' => 'Missing required fields']);
        exit();
    }
    $response = sendPostRequest(API_URL . '/shopping-lists', $inputData);
    echo json_encode($response);
}

// Обработчик для получения всех списков покупок пользователя (GET /shopping-lists/user/{userId})
if (preg_match('/^\/shopping-lists\/user\/(.+)$/', $_SERVER['REQUEST_URI'], $matches) && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = $matches[1];
    $response = sendGetRequest(API_URL . '/shopping-lists/user/' . $userId);
    echo json_encode($response);
}

// Обработчик для получения списка покупок по ID (GET /shopping-lists/{listId})
if (preg_match('/^\/shopping-lists\/(.+)$/', $_SERVER['REQUEST_URI'], $matches) && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $listId = $matches[1];
    $response = sendGetRequest(API_URL . '/shopping-lists/' . $listId);
    echo json_encode($response);
}

// Обработчик для добавления товара в список покупок (POST /shopping-lists/{listId}/items)
if (preg_match('/^\/shopping-lists\/(.+)\/items$/', $_SERVER['REQUEST_URI'], $matches) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $listId = $matches[1];
    $inputData = getRequestData();
    if (!isset($inputData['name'], $inputData['price'], $inputData['quantity'])) {
        echo json_encode(['error' => 'Missing required fields']);
        exit();
    }
    $response = sendPostRequest(API_URL . '/shopping-lists/' . $listId . '/items', $inputData);
    echo json_encode($response);
}

if (preg_match('/\/items\/(.+)$/', $_SERVER['REQUEST_URI'], $matches) && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $itemId = $matches[1];  // Получаем ID товара из URL

    $response = sendDeleteRequest(API_URL . '/items/' . $itemId);

    if (isset($response['message'])) {
        echo json_encode(['message' => $response['message']]);
    } else {
        echo json_encode(['error' => 'Failed to delete item']);
    }
}

if ($_SERVER['REQUEST_URI'] === '/items' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputData = getRequestData();  // Получаем данные из запроса

    if (!isset($inputData['name'], $inputData['price'])) {
        echo json_encode(['error' => 'Missing required fields']);
        exit();
    }

    $response = sendPostRequest(API_URL . '/items', $inputData);
    echo json_encode($response);
}
