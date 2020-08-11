import axios, {CancelToken} from 'axios'
import {Map} from 'immutable'

import {UserRole, User, UserDraft} from '../../config/types/user'
import {toImmutable, toJS} from '../../utils.js'
import {notify} from '../notifications/actions.js'
import {NotificationStatus} from '../notifications/types'
import {StoreDispatch} from '../types'

import * as constants from './constants'

export function fetchUsers(roles: UserRole[]) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.FETCH_USER_LIST_START,
        })

        let rolesParam = ''

        if (roles && roles instanceof Array) {
            rolesParam = `?roles[]=${roles.join('&roles[]=')}`
        }

        return axios
            .get<User[]>(`/api/users/${rolesParam}`)
            .then((json) => json.data)
            .then(
                (resp) => {
                    dispatch({
                        type: constants.FETCH_USER_LIST_SUCCESS,
                        resp,
                        roles,
                    })
                },
                (error) => {
                    return dispatch({
                        type: constants.FETCH_USER_LIST_ERROR,
                        error,
                        reason: 'Failed to fetch users',
                    })
                }
            )
    }
}

export const createAgent = (agent: UserDraft) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    return axios
        .post<User>('/api/users/', toJS(agent))
        .then((json) => json.data)
        .then(
            (data) => {
                const resp: Map<any, any> = toImmutable(data)

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
                })
            }
        )
}

export const deleteAgent = (id: number) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    return axios.delete(`/api/users/${id}/`).then(
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

export const fetchAgent = (id: number, cancelToken?: CancelToken) => (
    dispatch: StoreDispatch
): Promise<Map<any, any>> => {
    return axios
        .get<User>(`/api/users/${id}/`, cancelToken && {cancelToken})
        .then((json) => json.data)
        .then(
            (resp) => {
                return Promise.resolve(toImmutable(resp))
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

export const fetchPagination = (page = 1) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    return axios
        .get<User[]>('/api/users/', {
            params: {
                roles: Object.values(UserRole),
                page: page.toString(),
            },
        })
        .then((json) => json.data)
        .then(
            (resp) => {
                return dispatch({
                    type: constants.FETCH_AGENTS_PAGINATION_SUCCESS,
                    resp: toImmutable(resp),
                })
            },
            (error) => {
                return dispatch({
                    type: constants.FETCH_AGENTS_PAGINATION_ERROR,
                    error,
                    reason: 'Failed to fetch team members',
                })
            }
        )
}

export const inviteAgent = (id: number) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    return axios.post(`/api/users/${id}/invite/`).then(
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
    ) as Promise<ReturnType<StoreDispatch>>
}

export const updateAgent = (id: number, agent: UserDraft) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    return axios
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
                    resp: toImmutable(resp),
                })
            },
            (error) => {
                return dispatch({
                    type: constants.UPDATE_AGENT_ERROR,
                    error,
                    reason: 'Failed to update team member',
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
