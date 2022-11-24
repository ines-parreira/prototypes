import axios, {CancelToken} from 'axios'
import {Map} from 'immutable'

import {User, UserDraft} from 'config/types/user'
import {USER_ROLES} from 'config/user'
import {fetchAgents} from 'models/agents/resources'
import {FetchAgentsOptions} from 'models/agents/types'
import client from 'models/api/resources'
import GorgiasApi from 'services/gorgiasApi'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {StoreDispatch} from 'state/types'
import {toImmutable, toJS} from 'utils'

import * as constants from './constants'

export function fetchUsers(options: FetchAgentsOptions = {}) {
    return async (
        dispatch: StoreDispatch
    ): Promise<ReturnType<StoreDispatch>> => {
        const {cursor, externalId, limit, orderBy, roles = USER_ROLES} = options
        dispatch({
            type: constants.FETCH_USER_LIST_START,
        })

        const client = new GorgiasApi()
        const generator = client.cursorPaginate<User, FetchAgentsOptions>(
            fetchAgents,
            {
                cursor,
                externalId,
                limit,
                orderBy,
                roles,
            }
        )

        let result: User[] = []
        try {
            for await (const page of generator) {
                result = result.concat(page)
            }
            return dispatch({
                type: constants.FETCH_USER_LIST_SUCCESS,
                resp: result,
                roles,
            })
        } catch (error) {
            return dispatch({
                type: constants.FETCH_USER_LIST_ERROR,
                error,
                reason: 'Failed to fetch users',
            })
        }
    }
}

export const createAgent =
    (agent: UserDraft) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .post<User>('/api/users/', toJS(agent))
            .then((json) => json.data)
            .then(
                (data) => {
                    const resp = toImmutable<Map<any, any>>(data)

                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: `Team member created. We've sent login instructions to ${
                                resp.get('email') as string
                            }.`,
                        })
                    )

                    return dispatch({
                        type: constants.CREATE_AGENT_SUCCESS,
                        resp,
                    })
                },
                (error) => {
                    return dispatch({
                        type: constants.CREATE_AGENT_ERROR,
                        error,
                        reason: 'Failed to create team member',
                        verbose: true,
                    })
                }
            )
    }

export const deleteAgent =
    (id: number) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client.delete(`/api/users/${id}/`).then(
            () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Team member deleted',
                    })
                )

                return dispatch({
                    type: constants.DELETE_AGENT_SUCCESS,
                    id,
                })
            },
            (error) => {
                return dispatch({
                    type: constants.DELETE_AGENT_ERROR,
                    error,
                    reason: 'Failed to delete team member',
                    verbose: true,
                })
            }
        )
    }

export const fetchAgent =
    (id: number, cancelToken?: CancelToken) =>
    (dispatch: StoreDispatch): Promise<Map<any, any>> => {
        return client
            .get<User>(`/api/users/${id}/`, cancelToken && {cancelToken})
            .then((json) => json.data)
            .then(
                (resp) => {
                    return Promise.resolve(toImmutable<Map<any, any>>(resp))
                },
                (error) => {
                    if (!axios.isCancel(error)) {
                        dispatch({
                            type: constants.FETCH_AGENT_ERROR,
                            error,
                            reason: `Failed to fetch team member #${id}`,
                        })
                    }
                }
            ) as Promise<Map<any, any>>
    }

export const inviteAgent =
    (id: number) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client.post(`/api/users/${id}/invite/`).then(
            () => {
                return dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Team member invited',
                    })
                )
            },
            (error) => {
                return dispatch({
                    type: constants.INVITE_AGENT_ERROR,
                    error,
                    reason: 'Failed to invite team member',
                })
            }
        )
    }

export const updateAgent =
    (id: number, agent: UserDraft) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .put<User>(`/api/users/${id}/`, toJS(agent))
            .then((json) => json.data)
            .then(
                (resp) => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Team member updated',
                        })
                    )

                    return dispatch({
                        type: constants.UPDATE_AGENT_SUCCESS,
                        resp: toImmutable<Map<any, any>>(resp),
                    })
                },
                (error) => {
                    return dispatch({
                        type: constants.UPDATE_AGENT_ERROR,
                        error,
                        reason: 'Failed to update team member',
                        verbose: true,
                    })
                }
            )
    }

export const setAgentsLocations = (locations: Record<string, unknown>) => ({
    type: constants.SET_AGENTS_LOCATIONS,
    data: locations,
})

export const setAgentsTypingStatuses = (
    locations: Record<string, unknown>
) => ({
    type: constants.SET_AGENTS_TYPING_STATUSES,
    data: locations,
})
