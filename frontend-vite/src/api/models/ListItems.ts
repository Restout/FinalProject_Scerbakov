import { Item } from "./Item";

export type ListItems = {
    _id?: string;
    name?: string;
    userId?: string;
    items?: Array<Item>;
}