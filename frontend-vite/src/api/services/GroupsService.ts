import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import { Group } from '../models/Group';
import { Member } from '../models/Member';
export class GroupsService {

    public static postGroupsAdd(
        requestBody: {
            email: string;
        },
    ): CancelablePromise<{
        message?: string;
        group?: Group;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/groups/add',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request, such as when the user is already in the group.`,
                404: `User not found.`,
                500: `Internal server error.`,
            },
        });
    }

    public static postGroupsLeave(): CancelablePromise<{
        message?: string;
        group?: Group | null;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/groups/leave',
            errors: {
                404: `User is not part of any group.`,
                500: `Internal server error.`,
            },
        });
    }

    public static getGroupsMembers(): CancelablePromise<{
        members?: Array<Member>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/groups/members',
            errors: {
                404: `The user is not part of any group.`,
                500: `Internal server error.`,
            },
        });
    }
}
