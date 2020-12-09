import _omit from 'lodash/omit'

import client from '../api/resources'
import {ApiListResponsePagination} from '../api/types'

import {View, ViewDraft} from './types'

type SharedView = View & {
    shared_with_teams: {id: number}[]
    shared_with_users: {id: number}[]
}

export const fetchViews = async () => {
    const res = await client.get<ApiListResponsePagination<View[]>>(
        '/api/views/'
    )
    return res.data
}

export const createView = async (viewDraft: ViewDraft) => {
    const res = await client.post<View>('/api/views/', viewDraft)
    return res.data
}

export const updateView = async (view: View) => {
    const sharedProps = Object.assign(
        view?.shared_with_teams
            ? {shared_with_teams: view.shared_with_teams.map((team) => team.id)}
            : {},
        view?.shared_with_users
            ? {shared_with_users: view.shared_with_users.map((user) => user.id)}
            : {}
    )
    const res = await client.put<SharedView>(`/api/views/${view.id}/`, {
        ..._omit(view, 'filters_ast'),
        ...sharedProps,
    })
    delete res.data.shared_with_teams
    delete res.data.shared_with_users
    return res.data as View
}

export const deleteView = async (viewId: number) => {
    void (await client.delete(`/api/views/${viewId}/`))
}
