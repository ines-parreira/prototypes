import reqwest from 'reqwest'
import { systemMessage } from './systemMessage'

export const FETCH_SETTINGS_START = 'FETCH_SETTINGS_START'
export const FETCH_SETTINGS_SUCCESS = 'FETCH_SETTINGS_SUCCESS'

export const LOADED_SEARCH = 'LOADED_SEARCH'

export function fetchSettings() {
    return (dispatch) => {
        dispatch({
            type: FETCH_SETTINGS_START
        })

        return reqwest({
            url: '/api/settings/',
            type: 'json',
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: FETCH_SETTINGS_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to fetch settings',
                msg: err
            }))
        })
    }
}

// Called when an instantsearch widget has been loaded (page can be 'users', 'ticket'...)
export function loadedSearch(page) {
    return {
        type: LOADED_SEARCH,
        page
    }
}
