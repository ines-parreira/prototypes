import _omit from 'lodash/omit'

import {FeatureFlagKey} from 'config/featureFlags'
import client from 'models/api/resources'
import {
    ApiListResponseCursorPagination,
    ApiPaginationParams,
    CursorMeta,
    OldCursorMeta,
} from 'models/api/types'
import {Ticket, TicketPartial} from 'models/ticket/types'
import {getLDClient} from 'utils/launchDarkly'

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
        }
    )
}

export const getViewItems = async ({url, viewId, ...params}: ListParams) => {
    const launchDarklyClient = getLDClient()
    await launchDarklyClient.waitForInitialization()
    const enforceTicketsOnES = launchDarklyClient.variation(
        FeatureFlagKey.EnforceTicketsOnES
    )

    return await client.get<
        ApiListResponseCursorPagination<Ticket[], OldCursorMeta>
    >(
        url ?? `/api/views/${viewId}/items`,
        enforceTicketsOnES
            ? {...params, headers: {'x-gorgias-search-engine': 'ES'}}
            : {params}
    )
}

export type ViewTicketUpdatesParams = {
    cursor?: string | null
    limit?: number
    order_by?: string
    up_to_timestamp?: number
}

export function getViewTicketUpdates(
    viewId: number,
    params?: ViewTicketUpdatesParams
) {
    return client.get<
        ApiListResponseCursorPagination<TicketPartial[], CursorMeta>
    >(`/api/views/${viewId}/tickets/updates`, {params})
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
