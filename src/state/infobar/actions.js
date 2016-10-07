import axios from 'axios'
import * as types from './constants'

export const search = (query, docType = 'user', source = []) => ((dispatch) => {
    dispatch({
        type: docType === 'user' ? types.SEARCH_USERS_START : types.SEARCH_TICKETS_START
    })

    return axios.post('/api/search/', {
        doc_type: docType,
        query: {
            _source: source, // ['id', 'name', 'email']
            query
        }
    })
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch({
                type: docType === 'user' ? types.SEARCH_USERS_SUCCESS : types.SEARCH_TICKETS_SUCCESS,
                resp
            })
        })
        .catch(error => {
            dispatch({
                type: docType === 'user' ? types.SEARCH_USERS_ERROR : types.SEARCH_TICKETS_ERROR,
                error,
                reason: 'Failed to do the search. Please try again...'
            })
        })
})

export const resetSearch = () => ({
    type: types.RESET_SEARCH
})

export const fetchPreviewUser = (userId) => ((dispatch) => {
    dispatch({
        type: types.FETCH_PREVIEW_USER_START
    })

    return axios.get(`/api/users/${userId}/`)
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch({
                type: types.FETCH_PREVIEW_USER_SUCCESS,
                resp
            })
        })
        .catch(error => {
            dispatch({
                type: types.FETCH_PREVIEW_USER_ERROR,
                error,
                reason: 'Couldn\'t fetch the user. Please try again in a few minutes.'
            })
        })
})

export const setInfobarMode = (mode) => ({
    type: types.SET_INFOBAR_MODE,
    mode
})
