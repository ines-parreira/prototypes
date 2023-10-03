import _omit from 'lodash/omit'
import {stringify} from 'qs'

import client from 'models/api/resources'
import {
    ApiListResponseCursorPagination,
    ApiPaginationParams,
} from 'models/api/types'

import {Ticket} from 'models/ticket/types'
import {ListParams, View, ViewDraft} from './types'

type SharedView = View & {
    shared_with_teams: {id: number}[]
    shared_with_users: {id: number}[]
}

export const fetchViewsPaginated = async (params: ApiPaginationParams = {}) => {
    return await client.get<ApiListResponseCursorPagination<View[]>>(
        `/api/views/`,
        {
            params,
            paramsSerializer: stringify,
        }
    )
}

export type UseGetViewItems = Awaited<ReturnType<typeof getViewItems>>

export const getViewItems = async ({viewId, ...params}: ListParams) => {
    return await client.get<ApiListResponseCursorPagination<Ticket[]>>(
        `/api/views/${viewId}/items/`,
        {
            params,
        }
    )
}

export const createView = async (viewDraft: ViewDraft) => {
    const res = await client.post<View>(
        '/api/views/',
        _omit(viewDraft, 'search')
    )
    return res.data
}

export const updateView = async (id: number, view: Partial<View>) => {
    const sharedProps = Object.assign(
        view?.shared_with_teams
            ? {shared_with_teams: view.shared_with_teams.map((team) => team.id)}
            : {},
        view?.shared_with_users
            ? {shared_with_users: view.shared_with_users.map((user) => user.id)}
            : {}
    )
    const res = await client.put<SharedView>(`/api/views/${id}/`, {
        ..._omit(view, 'filters_ast', 'search'),
        ...sharedProps,
    })
    return _omit(res.data, ['shared_with_teams', 'shared_with_users']) as View
}

export const deleteView = async (viewId: number) => {
    void (await client.delete(`/api/views/${viewId}/`))
}
