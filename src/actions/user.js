import reqwest from 'reqwest'
import { systemMessage } from './systemMessage'

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


export function fetchUsers() {
    return (dispatch) => {
        dispatch({
            type: FETCH_USER_LIST_START
        })

        return reqwest({
            url: `/api/users/`,
            type: 'json',
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: FETCH_USER_LIST_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to fetch users',
                msg: err
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
                msg: err
            }))
        })
    }
}

export function createUser(data) {
    return (dispatch) => {
        dispatch({
            type: CREATE_NEW_USER_START
        })

        data.roles = [data.role.slice(0)]
        delete data.role

        data.password = ''

        return reqwest({
            url: `/api/users/`,
            type: 'json',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data)
        }).then((resp) => {
            dispatch({
                type: CREATE_NEW_USER_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to create the new user',
                msg: err
            }))
        })
    }
}

export function updateUser(data, userId) {
    return (dispatch) => {
        dispatch({
            type: UPDATE_USER_START
        })

        if (data.role) {
            data.roles = [data.role.slice(0)]
            delete data.role
        }

        return reqwest({
            url: `/api/users/${userId}/`,
            type: 'json',
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data)
        }).then((resp) => {
            dispatch({
                type: UPDATE_USER_SUCCESS,
                userId: userId,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to update the user',
                msg: err
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
                userId: userId,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to update the user',
                msg: err
            }))
        })
    }
}

export function sortUsers(sort) {
    return (dispatch) => {
        dispatch({
            type: SORT_USERS,
            sort: sort
        })
    }
}

export function updateList(list) {
    return (dispatch) => {
        dispatch({
            type: UPDATE_LIST,
            list: list
        })
    }
}
