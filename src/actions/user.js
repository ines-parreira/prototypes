import reqwest from 'reqwest'
import { systemMessage } from './systemMessage'

// Fetch individual view definitions
export const FETCH_USER_START = 'FETCH_USER_START'
export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS'
export const FETCH_CURRENT_USER_SUCCESS = 'FETCH_CURRENT_USER_SUCCESS'

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
