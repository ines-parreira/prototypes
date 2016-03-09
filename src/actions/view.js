import reqwest from 'reqwest'

// Basic operations on the views
export const NEW_VIEW = 'NEW_VIEW'

// Fetch individual view definitions
export const FETCH_VIEW_START = 'FETCH_VIEW_START'
export const FETCH_VIEW_SUCCESS = 'FETCH_VIEW_SUCCESS'
export const FETCH_VIEW_ERROR = 'FETCH_VIEW_ERROR'

// Update individual view definitions
export const UPDATE_VIEW_START = 'UPDATE_VIEW_START'
export const UPDATE_VIEW_SUCCESS = 'UPDATE_VIEW_SUCCESS'
export const UPDATE_VIEW_ERROR = 'UPDATE_VIEW_ERROR'

// Fetch list views
export const FETCH_VIEW_LIST_START = 'FETCH_VIEW_LIST_START'
export const FETCH_VIEW_LIST_SUCCESS = 'FETCH_VIEW_LIST_SUCCESS'
export const FETCH_VIEW_LIST_ERROR = 'FETCH_VIEW_LIST_ERROR'


export function fetchViews(url, data = {}, type = 'list') {
    return (dispatch) => {
        dispatch({
            type: type === 'list' ? FETCH_VIEW_LIST_START : FETCH_VIEW_START
        })

        return reqwest({
            url: url,
            data: data,
            type: 'json',
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: type === 'list' ? FETCH_VIEW_LIST_SUCCESS : FETCH_VIEW_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch({
                type: type === 'list' ? FETCH_VIEW_LIST_ERROR : FETCH_VIEW_ERROR,
                err
            })
        })
    }
}

export function updateView(id, slug, data = {}) {
    const url = `/api/views/${id}/`
    // Ensure we have the slug for the backend schema
    data.slug = slug

    return (dispatch) => {
        dispatch({
            type: UPDATE_VIEW_START,
            slug,
            data
        })

        return reqwest({
            url: url,
            data: JSON.stringify(data),
            type: 'json',
            method: 'PUT',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: UPDATE_VIEW_SUCCESS,
                slug,
                resp
            })
        }).catch((err) => {
            dispatch({
                type: UPDATE_VIEW_ERROR,
                slug,
                err
            })
        })
    }
}
