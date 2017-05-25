import axios from 'axios'

import {toJS, toImmutable} from '../../utils'
import {notify} from '../notifications/actions'
import * as types from './constants'

export const createAgent = (agent) => (dispatch) => {
    agent = toJS(agent)
    return axios.post('/api/users/', agent)
        .then((json = {}) => json.data)
        .then(resp => {
            resp = toImmutable(resp)

            dispatch(notify({
                type: 'success',
                message: `Team member created. We've sent login instructions to ${resp.get('email')}.`,
            }))

            return dispatch({
                type: types.CREATE_AGENT_SUCCESS,
                resp,
            })
        }, error => {
            return dispatch({
                type: types.CREATE_AGENT_ERROR,
                error,
                reason: 'Failed to create team member',
            })
        })
}

export const createAgents = (agents = []) => (dispatch) => {
    agents = toJS(agents)
    return axios.post('/api/agents/', agents)
        .then((json = {}) => json.data)
        .then(resp => {
            resp = toImmutable(resp)

            dispatch(notify({
                type: 'success',
                message: 'Team members created',
            }))

            return dispatch({
                type: types.CREATE_AGENTS_SUCCESS,
                resp,
            })
        }, error => {
            return dispatch({
                type: types.CREATE_AGENTS_ERROR,
                error,
                reason: 'Failed to create team members',
            })
        })
}

export const deleteAgent = (id) => (dispatch) => {
    return axios.delete(`/api/users/${id}/`)
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch(notify({
                type: 'success',
                message: 'Team member deleted',
            }))

            return dispatch({
                type: types.DELETE_AGENT_SUCCESS,
                resp,
            })
        }, error => {
            return dispatch({
                type: types.DELETE_AGENT_ERROR,
                error,
                reason: 'Failed to delete team member',
            })
        })
}

export const fetchAgent = (id) => (dispatch) => {
    return axios.get(`/api/users/${id}/`)
        .then((json = {}) => json.data)
        .then(resp => {
            return Promise.resolve(toImmutable(resp))
        }, error => {
            return dispatch({
                type: types.FETCH_AGENT_ERROR,
                error,
                reason: `Failed to fetch team member #${id}`,
            })
        })
}

export const fetchPagination = (page = 1) => (dispatch) => { // eslint-disable-line
    return axios.get('/api/users/?roles[]=admin&roles[]=agent&roles[]=staff')
        .then((json = {}) => json.data)
        .then(resp => {
            resp = toImmutable(resp)

            return dispatch({
                type: types.FETCH_AGENTS_PAGINATION_SUCCESS,
                resp,
            })
        }, error => {
            return dispatch({
                type: types.FETCH_AGENTS_PAGINATION_ERROR,
                error,
                reason: 'Failed to fetch team members',
            })
        })
}

export const inviteAgent = (id) => (dispatch) => {
    return axios.post(`/api/agents/${id}/invite/`)
        .then((json = {}) => json.data)
        .then(() => {
            return dispatch(notify({
                type: 'success',
                message: 'Team member invited',
            }))
        }, error => {
            return dispatch({
                type: types.INVITE_AGENT_ERROR,
                error,
                reason: 'Failed to invite team member',
            })
        })
}

export const updateAgent = (id, agent) => (dispatch) => {
    agent = toJS(agent)
    return axios.put(`/api/users/${id}/`, agent)
        .then((json = {}) => json.data)
        .then(resp => {
            resp = toImmutable(resp)

            dispatch(notify({
                type: 'success',
                message: 'Team member updated',
            }))

            return dispatch({
                type: types.UPDATE_AGENT_SUCCESS,
                resp,
            })
        }, error => {
            return dispatch({
                type: types.UPDATE_AGENT_ERROR,
                error,
                reason: 'Failed to update team member',
            })
        })
}
