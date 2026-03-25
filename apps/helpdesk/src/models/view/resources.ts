import _omit from 'lodash/omit'

import type { CursorPaginationMeta } from '@gorgias/helpdesk-queries'

import client from 'models/api/resources'
import type {
    ApiListResponseCursorPagination,
    ApiPaginationParams,
} from 'models/api/types'
import type { TicketPartial } from 'models/ticket/types'

import type { View, ViewDraft } from './types'

type SharedView = View & {
    shared_with_teams: { id: number }[]
    shared_with_users: { id: number }[]
}

export const fetchViewsPaginated = async (params: ApiPaginationParams = {}) => {
    return await client.get<ApiListResponseCursorPagination<View[]>>(
        `/api/views/`,
        {
            params,
        },
    )
}

export type ViewTicketUpdatesParams = {
    cursor?: string | null
    limit?: number
    order_by?: string
    up_to_cursor?: string | null
    up_to_datetime?: number | string | null
}

export function getViewTicketUpdates(
    viewId: number,
    params?: ViewTicketUpdatesParams,
) {
    return client.get<
        ApiListResponseCursorPagination<TicketPartial[], CursorPaginationMeta>
    >(`/api/views/${viewId}/tickets/updates`, { params })
}

export const createView = async (viewDraft: ViewDraft) => {
    const res = await client.post<View>(
        '/api/views/',
        _omit(viewDraft, 'search', 'created_datetime', 'deactivated_datetime'),
    )
    return res.data
}

export const updateView = async (id: number, view: Partial<View>) => {
    const sharedProps = Object.assign(
        view?.shared_with_teams
            ? {
                  shared_with_teams: view.shared_with_teams.map(
                      (team) => team.id,
                  ),
              }
            : {},
        view?.shared_with_users
            ? {
                  shared_with_users: view.shared_with_users.map(
                      (user) => user.id,
                  ),
              }
            : {},
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
