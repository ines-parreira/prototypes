import axios from 'axios'
import {fromJS} from 'immutable'
import md5 from 'md5'
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
            return dispatch({
                type: docType === 'user' ? types.SEARCH_USERS_ERROR : types.SEARCH_TICKETS_ERROR,
                error,
                reason: 'Failed to do the search. Please try again...'
            })
        })
})

export const resetSearch = () => ({
    type: types.RESET_SEARCH
})

export const fetchUserPicture = (email) => ((dispatch) => {
    dispatch({
        type: types.FETCH_USER_PICTURE_START
    })

    // s = 50 means the picture's width=height=50px; d=404 means if there's no image, returns a 404 error
    const GRAVATAR_URL = `https://www.gravatar.com/avatar/${md5(email)}?d=404&s=50`
    const GOOGLE_URL = `https://picasaweb.google.com/data/entry/api/user/${encodeURIComponent(email)}?alt=json`

    return axios.get(GRAVATAR_URL)
        .then(() => {
            dispatch({
                type: types.FETCH_USER_PICTURE_SUCCESS,
                url: GRAVATAR_URL
            })
        })
        .catch(() => {
            return axios.get(GOOGLE_URL)
                .then((json = {}) => json.data)
                .then((data = {}) => {
                    const thumbnailUrl = fromJS(data).getIn(['entry', 'gphoto$thumbnail', '$t'])

                    if (thumbnailUrl) {
                        dispatch({
                            type: types.FETCH_USER_PICTURE_SUCCESS,
                            url: thumbnailUrl
                        })
                    } else {
                        dispatch({
                            type: types.FETCH_USER_PICTURE_ERROR
                        })
                    }
                })
                .catch(error => {
                    return dispatch({
                        type: types.FETCH_USER_PICTURE_ERROR,
                        error,
                    })
                })
        })
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
            return dispatch({
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
