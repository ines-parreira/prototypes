import axios from 'axios'
import _isUndefined from 'lodash/isUndefined'
import * as types from './constants'
import {notify} from '../notifications/actions'

// THE FOLLOWING FUNCTION IS ONLY USED TO FETCH AGENTS AND ADMINS
// SHOULD BE UPDATED TO AN AGENTS SPECIFIC REDUCER
export function fetchUsers(roles) {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_USER_LIST_START
        })

        let rolesParam = ''

        if (roles && roles instanceof Array) {
            rolesParam = `?roles[]=${roles.join('&roles[]=')}`
        }

        return axios.get(`/api/users/${rolesParam}`)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_USER_LIST_SUCCESS,
                    resp,
                    roles
                })
            }, error => {
                return dispatch({
                    type: types.FETCH_USER_LIST_ERROR,
                    error,
                    reason: 'Failed to fetch users'
                })
            })
    }
}

export function fetchUser(userId) {
    return (dispatch) => {
        const isCurrentUser = userId === 0

        dispatch({
            type: isCurrentUser ? types.FETCH_CURRENT_USER_START : types.FETCH_USER_START
        })

        return axios.get(`/api/users/${userId}/`)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: isCurrentUser ? types.FETCH_CURRENT_USER_SUCCESS : types.FETCH_USER_SUCCESS,
                    resp
                })
            }, error => {
                return dispatch({
                    type: isCurrentUser ? types.FETCH_CURRENT_USER_ERROR : types.FETCH_USER_ERROR,
                    error,
                    reason: 'Failed to fetch user'
                })
            })
    }
}

export function submitUser(data, userId) {
    return (dispatch) => {
        const isCurrentUser = userId === 0
        const isUpdate = !_isUndefined(userId)
        let promise

        dispatch({
            type: isCurrentUser ? types.SUBMIT_CURRENT_USER_START : types.SUBMIT_USER_START
        })

        if (isUpdate) {
            promise = axios.put(`/api/users/${userId}/`, data)
        } else {
            promise = axios.post('/api/users/', data)
        }

        return promise
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: isCurrentUser ? types.SUBMIT_CURRENT_USER_SUCCESS : types.SUBMIT_USER_SUCCESS,
                    isUpdate,
                    userId,
                    resp
                })

                dispatch(notify({
                    type: 'success',
                    message: `User successfully ${isUpdate ? 'updated' : 'created'}`
                }))

                return resp
            }, error => {
                return dispatch({
                    type: isCurrentUser ? types.SUBMIT_CURRENT_USER_ERROR : types.SUBMIT_USER_ERROR,
                    error,
                    reason: `Failed to ${isUpdate ? 'update' : 'create'} user`
                })
            })
    }
}

export function deleteUser(userId) {
    return (dispatch) => {
        dispatch({
            type: types.DELETE_USER_START
        })

        return axios.delete(`/api/users/${userId}/`)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.DELETE_USER_SUCCESS,
                    userId,
                    resp
                })

                dispatch(notify({
                    type: 'success',
                    message: 'User successfully deleted'
                }))
            }, error => {
                return dispatch({
                    type: types.DELETE_USER_ERROR,
                    error,
                    reason: 'Failed to update the user'
                })
            })
    }
}

export function fetchUserHistory(userId, options) {
    return (dispatch, getState) => {
        dispatch({
            type: types.FETCH_USER_HISTORY_START,
            userId,
        })

        return axios.get(`/api/users/${userId}/tickets/?type=requested`)
            .then((json = {}) => json.data)
            .then(resp => {
                const state = getState()

                let shouldTriggerSuccess = true
                if (options.successCondition) {
                    shouldTriggerSuccess = options.successCondition(state)
                }

                if (shouldTriggerSuccess) {
                    dispatch({
                        type: types.FETCH_USER_HISTORY_SUCCESS,
                        userId,
                        resp
                    })
                }
            }, error => {
                return dispatch({
                    type: types.FETCH_USER_HISTORY_ERROR,
                    error,
                    reason: 'Couldn\'t fetch user\'s tickets. Please try again in a few minutes.'
                })
            })
    }
}

export function mergeUsers(baseUserId, mergeUserId, data) {
    return (dispatch) => {
        dispatch({
            type: types.MERGE_USERS_START
        })

        return axios.put(`/api/users/${baseUserId}/merge/${mergeUserId}/`, data)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.MERGE_USERS_SUCCESS,
                    resp
                })

                dispatch(notify({
                    type: 'success',
                    message: 'Users successfully merged. Search data is being updated, it might take a few minutes.'
                }))
            }, error => {
                dispatch({
                    type: types.MERGE_USERS_ERROR,
                    error,
                    reason: 'Couldn\'t merge users. Please try again in a few minutes.'
                })
            })
    }
}

export const clearUser = () => ({type: types.CLEAR_USER})
