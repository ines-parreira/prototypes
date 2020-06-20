// @flow
import axios, {CancelToken} from 'axios'

import type {Map} from 'immutable'

import {USER_ROLES} from '../../config/user'
import {toImmutable, toJS} from '../../utils'
import {notify} from '../notifications/actions'
import type {dispatchType} from '../types'

import * as constants from './constants'

type agentType = {}

export function fetchUsers(roles: Array<string>) {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        dispatch({
            type: constants.FETCH_USER_LIST_START
        })

        let rolesParam = ''

        if (roles && roles instanceof Array) {
            rolesParam = `?roles[]=${roles.join('&roles[]=')}`
        }

        return axios.get(`/api/users/${rolesParam}`)
            .then((json = {}) => json.data)
            .then((resp) => {
                dispatch({
                    type: constants.FETCH_USER_LIST_SUCCESS,
                    resp,
                    roles
                })
            }, (error) => {
                return dispatch({
                    type: constants.FETCH_USER_LIST_ERROR,
                    error,
                    reason: 'Failed to fetch users'
                })
            })
    }
}

export const createAgent = (agent: agentType) => (dispatch: dispatchType): Promise<dispatchType> => {
    agent = toJS(agent)
    return axios.post('/api/users/', agent)
        .then((json = {}) => json.data)
        .then((data) => {
            const resp: Map<*,*> = toImmutable(data)

            dispatch(notify({
                status: 'success',
                message: `Team member created. We've sent login instructions to ${resp.get('email')}.`,
            }))

            return dispatch({
                type: constants.CREATE_AGENT_SUCCESS,
                resp,
            })
        }, (error) => {
            return dispatch({
                type: constants.CREATE_AGENT_ERROR,
                error,
                reason: 'Failed to create team member',
            })
        })
}

export const deleteAgent = (id: string) => (dispatch: dispatchType): Promise<dispatchType> => {
    return axios.delete(`/api/users/${id}/`)
        .then((json = {}) => json.data)
        .then((resp) => {
            dispatch(notify({
                status: 'success',
                message: 'Team member deleted',
            }))

            return dispatch({
                type: constants.DELETE_AGENT_SUCCESS,
                resp,
                id,
            })
        }, (error) => {
            return dispatch({
                type: constants.DELETE_AGENT_ERROR,
                error,
                reason: 'Failed to delete team member',
                verbose: true,
            })
        })
}

export const fetchAgent = (id: string, cancelToken?: CancelToken) => (dispatch: dispatchType): Promise<?Map<*,*>> => {
    return axios.get(`/api/users/${id}/`, cancelToken && {cancelToken})
        .then((json = {}) => json.data)
        .then((resp) => {
            return Promise.resolve(toImmutable(resp))
        }, (error) => {
            if (!axios.isCancel(error)) {
                dispatch({
                    type: constants.FETCH_AGENT_ERROR,
                    error,
                    reason: `Failed to fetch team member #${id}`,
                })
            }
        })
}

// eslint-disable-next-line
export const fetchPagination = (page: number = 1) => (dispatch: dispatchType): Promise<dispatchType> => {
    return axios.get('/api/users/', {
        params: {
            roles: USER_ROLES,
            page:  page.toString()
        }})
        .then((json = {}) => json.data)
        .then((resp) => {
            resp = toImmutable(resp)

            return dispatch({
                type: constants.FETCH_AGENTS_PAGINATION_SUCCESS,
                resp,
            })
        }, (error) => {
            return dispatch({
                type: constants.FETCH_AGENTS_PAGINATION_ERROR,
                error,
                reason: 'Failed to fetch team members',
            })
        })
}

export const inviteAgent = (id: string) => (dispatch: dispatchType): Promise<dispatchType> => {
    return axios.post(`/api/users/${id}/invite/`)
        .then((json = {}) => json.data)
        .then(() => {
            return dispatch(notify({
                status: 'success',
                message: 'Team member invited',
            }))
        }, (error) => {
            return dispatch({
                type: constants.INVITE_AGENT_ERROR,
                error,
                reason: 'Failed to invite team member',
            })
        })
}

export const updateAgent = (id: string, agent: agentType) => (dispatch: dispatchType): Promise<dispatchType> => {
    agent = toJS(agent)
    return axios.put(`/api/users/${id}/`, agent)
        .then((json = {}) => json.data)
        .then((resp) => {
            resp = toImmutable(resp)

            dispatch(notify({
                status: 'success',
                message: 'Team member updated',
            }))

            return dispatch({
                type: constants.UPDATE_AGENT_SUCCESS,
                resp,
            })
        }, (error) => {
            return dispatch({
                type: constants.UPDATE_AGENT_ERROR,
                error,
                reason: 'Failed to update team member',
            })
        })
}

export const setAgentsLocations = (locations: {}) => ({
    type: constants.SET_AGENTS_LOCATIONS,
    data: locations,
})

export const setAgentsTypingStatuses = (locations: {}) => ({
    type: constants.SET_AGENTS_TYPING_STATUSES,
    data: locations,
})
