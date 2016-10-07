import axios from 'axios'
import * as types from './constants'
import {notify} from '../notifications/actions'

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
            })
            .catch(error => {
                dispatch({
                    type: types.FETCH_USER_LIST_ERROR,
                    error,
                    reason: 'Failed to fetch users'
                })
            })
    }
}

export function search(query, params, stringQuery) {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_USER_LIST_START,
            stringQuery,
            params
        })

        const builtQuery = query

        if (!stringQuery || stringQuery.length < 3) {
            delete builtQuery.query
        }

        return axios.post('/api/search/', {
            doc_type: 'user',
            query: builtQuery,
            params
        })
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_USER_LIST_SUCCESS,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.FETCH_USER_LIST_ERROR,
                    error,
                    reason: 'Failed to search users'
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
            })
            .catch(error => {
                dispatch({
                    type: isCurrentUser ? types.FETCH_CURRENT_USER_ERROR : types.FETCH_USER_ERROR,
                    error,
                    reason: 'Failed to fetch user'
                })
            })
    }
}

export function createUser(data) {
    return (dispatch) => {
        dispatch({
            type: types.CREATE_NEW_USER_START
        })

        const newData = Object.assign({}, data)
        newData.roles = [data.role]
        delete newData.role

        return axios.post('/api/users/', newData)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.CREATE_NEW_USER_SUCCESS,
                    resp
                })

                dispatch(notify({
                    type: 'success',
                    message: 'User successfully created'
                }))
            })
            .catch(error => {
                dispatch({
                    type: types.CREATE_NEW_USER_ERROR,
                    error,
                    reason: 'Failed to create the new user'
                })
            })
    }
}

export function updateUser(data, userId) {
    return (dispatch) => {
        const isCurrentUser = userId === 0

        dispatch({
            type: isCurrentUser ? types.UPDATE_CURRENT_USER_START : types.UPDATE_USER_START
        })

        return axios.put(`/api/users/${userId}/`, data)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: isCurrentUser ? types.UPDATE_CURRENT_USER_SUCCESS : types.UPDATE_USER_SUCCESS,
                    userId,
                    resp
                })

                dispatch(notify({
                    type: 'success',
                    message: 'User successfully updated'
                }))
            })
            .catch(error => {
                dispatch({
                    type: isCurrentUser ? types.UPDATE_CURRENT_USER_ERROR : types.UPDATE_USER_ERROR,
                    error,
                    reason: 'Failed to update the user'
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
            })
            .catch(error => {
                dispatch({
                    type: types.DELETE_USER_ERROR,
                    error,
                    reason: 'Failed to update the user'
                })
            })
    }
}

export function sortUsers(sortField, sortDirection) {
    return {
        type: types.SORT_USERS,
        sortField,
        sortDirection
    }
}

export function updateList(list) {
    return {
        type: types.UPDATE_LIST,
        list
    }
}

