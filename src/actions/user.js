import reqwest from 'reqwest'
import {systemMessage} from './systemMessage'

// Fetch individual view definitions
export const FETCH_USER_START = 'FETCH_USER_START'
export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS'
export const FETCH_CURRENT_USER_SUCCESS = 'FETCH_CURRENT_USER_SUCCESS'

export const FETCH_USER_LIST_START = 'FETCH_USER_LIST_START'
export const FETCH_USER_LIST_SUCCESS = 'FETCH_USER_LIST_SUCCESS'

export const CREATE_NEW_USER_START = 'CREATE_NEW_USER_START'
export const CREATE_NEW_USER_SUCCESS = 'CREATE_NEW_USER_SUCCESS'

export const UPDATE_USER_START = 'UPDATE_USER_START'
export const UPDATE_USER_SUCCESS = 'UPDATE_USER_SUCCESS'

export const DELETE_USER_START = 'DELETE_USER_START'
export const DELETE_USER_SUCCESS = 'DELETE_USER_SUCCESS'

export const SORT_USERS = 'SORT_USERS'

export const UPDATE_LIST = 'UPDATE_LIST'


export function fetchUsers(roles) {
    return (dispatch) => {
        dispatch({
            type: FETCH_USER_LIST_START
        })

        let rolesParam = ''

        if (roles && roles instanceof Array) {
            rolesParam = `?roles[]=${roles.join('&roles[]=')}`
        }

        return reqwest({
            url: `/api/users/${rolesParam}`,
            type: 'json',
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: FETCH_USER_LIST_SUCCESS,
                resp,
                roles
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to fetch users',
                internalMessage: err
            }))
        })
    }
}

export function search(query, params, stringQuery) {
    return (dispatch) => {
        dispatch({
            type: FETCH_USER_LIST_START,
            stringQuery,
            params
        })

        const builtQuery = query

        if (!stringQuery || stringQuery.length < 3) {
            delete builtQuery.query
        }

        return reqwest({
            url: '/api/search/',
            data: JSON.stringify({
                doc_type: 'user',
                query: builtQuery,
                params
            }),
            type: 'json',
            method: 'POST',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: FETCH_USER_LIST_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to search users',
                internalMessage: err
            }))
        })
    }
}

export function fetchUser(userId) {
    return (dispatch) => {
        dispatch({
            type: FETCH_USER_START
        })

        return reqwest({
            url: `/api/users/${userId}/`,
            type: 'json',
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: userId === 0 ? FETCH_CURRENT_USER_SUCCESS : FETCH_USER_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: Failed to fetch user.',
                internalMessage: err
            }))
        })
    }
}


export function createUser(data) {
    return (dispatch) => {
        dispatch({
            type: CREATE_NEW_USER_START
        })

        const newData = Object.assign({}, data)
        newData.roles = [data.role]
        delete newData.role

        newData.password = ''

        return reqwest({
            url: '/api/users/',
            type: 'json',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newData)
        }).then((resp) => {
            dispatch({
                type: CREATE_NEW_USER_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to create the new user',
                internalMessage: err
            }))
        })
    }
}

export function updateUser(data, userId) {
    return (dispatch) => {
        dispatch({
            type: UPDATE_USER_START
        })

        return reqwest({
            url: `/api/users/${userId}/`,
            type: 'json',
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data)
        }).then((resp) => {
            dispatch({
                type: UPDATE_USER_SUCCESS,
                userId,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to update the user',
                internalMessage: err
            }))
        })
    }
}

export function deleteUser(userId) {
    return (dispatch) => {
        dispatch({
            type: DELETE_USER_START
        })

        return reqwest({
            url: `/api/users/${userId}/`,
            method: 'DELETE'
        }).then((resp) => {
            dispatch({
                type: DELETE_USER_SUCCESS,
                userId,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to update the user',
                internalMessage: err
            }))
        })
    }
}

export function sortUsers(sortField, sortDirection) {
    return {
        type: SORT_USERS,
        sortField,
        sortDirection
    }
}

export function updateList(list) {
    return {
        type: UPDATE_LIST,
        list
    }
}

