import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import { AddItem } from '../models/AddItem';
import { AddItemResponse } from '../models/AddItemResponse';
import { AddList } from '../models/AddList';
import { Item } from '../models/Item';
import { ListItems } from '../models/ListItems';
import { LoginForm } from '../models/LoginForm';
import { RegisterForm } from '../models/RegisterForm';
export class DefaultService {

    public static postRegister(
        requestBody: RegisterForm
    ): CancelablePromise<{
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Ошибка при регистрации (например, email уже существует)`,
                500: `Ошибка на сервере`,
            },
        });
    }

    public static postLogin(
        requestBody: LoginForm,
    ): CancelablePromise<{
        token?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Ошибка при входе (неправильный email или пароль)`,
                500: `Ошибка на сервере`,
            },
        });
    }

    public static postShoppingLists(
        requestBody: AddList,
    ): CancelablePromise<{
        _id?: string;
        name?: string;
        userId?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/shopping-lists',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Ошибка при создании списка`,
            },
        });
    }

    public static getShoppingListsUser(
        userId: string,
    ): CancelablePromise<Array<ListItems>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shopping-lists/user/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                500: `Ошибка при получении списка`,
            },
        });
    }

    public static getShoppingListItems(
        listId: string,
    ): CancelablePromise<ListItems> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/shopping-lists/{listId}',
            path: {
                'listId': listId,
            },
            errors: {
                404: `Список покупок не найден`,
                500: `Ошибка на сервере`,
            },
        });
    }

    public static postShoppingListsItems(
        listId: string,
        requestBody: Item
    ): CancelablePromise<ListItems> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/shopping-lists/{listId}/items',
            path: {
                'listId': listId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Список покупок не найден`,
                500: `Ошибка на сервере`,
            },
        });
    }

    public static postItems(
        requestBody: AddItem,
    ): CancelablePromise<AddItemResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/items',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Ошибка при добавлении товара`,
            },
        });
    }

    public static deleteItems(
        id: string,
    ): CancelablePromise<{
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/items/{id}',
            path: {
                'id': id,
            },
            errors: {
                500: `Ошибка на сервере`,
            },
        });
    }
}
