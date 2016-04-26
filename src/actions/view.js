import reqwest from 'reqwest'

// Basic operations on the views
export const NEW_VIEW = 'NEW_VIEW'

export const UPDATE_VIEW = 'UPDATE_VIEW'
export const UPDATE_VIEW_FILTERS = 'UPDATE_VIEW_FILTERS'
export const CLEAR_VIEW_FILTER = 'CLEAR_VIEW_FILTER'

// Fetch individual view definitions
export const FETCH_VIEW_START = 'FETCH_VIEW_START'
export const FETCH_VIEW_SUCCESS = 'FETCH_VIEW_SUCCESS'
export const FETCH_VIEW_ERROR = 'FETCH_VIEW_ERROR'

// Update individual view definitions
export const SUBMIT_VIEW_START = 'SUBMIT_VIEW_START'
export const SUBMIT_VIEW_SUCCESS = 'SUBMIT_VIEW_SUCCESS'
export const SUBMIT_VIEW_ERROR = 'SUBMIT_VIEW_ERROR'

// Fetch list views
export const FETCH_VIEW_LIST_START = 'FETCH_VIEW_LIST_START'
export const FETCH_VIEW_LIST_SUCCESS = 'FETCH_VIEW_LIST_SUCCESS'
export const FETCH_VIEW_LIST_ERROR = 'FETCH_VIEW_LIST_ERROR'

// Read views
export const APPLY_VIEW = 'APPLY_VIEW'

export function applyView(slug) {
    return {
        type: APPLY_VIEW,
        slug
    }
}

export function updateView(slug, data) {
    return {
        type: UPDATE_VIEW,
        slug,
        data: Object.assign({}, data, { dirty: true })
    }
}


export function updateFilters(slug, newFilters) {
    return {
        type: UPDATE_VIEW_FILTERS,
        slug,
        newFilters
    }
}


export function clearFilter(slug, name) {
    return {
        type: CLEAR_VIEW_FILTER,
        slug,
        name
    }
}

export function fetchViews() {
    const url = '/api/views/'
    const data = { type: 'ticket-list' }
    const type = 'list'
    return (dispatch) => {
        dispatch({
            type: type === 'list' ? FETCH_VIEW_LIST_START : FETCH_VIEW_START
        })

        return reqwest({
            url: url,
            data: data,
            type: 'json',
            method: 'GET',
            contentType: 'application/json',
        }).then((resp) => {
            dispatch({
                type: type === 'list' ? FETCH_VIEW_LIST_SUCCESS : FETCH_VIEW_SUCCESS,
                resp,
            })
        }).catch((err) => {
            dispatch({
                type: type === 'list' ? FETCH_VIEW_LIST_ERROR : FETCH_VIEW_ERROR,
                err,
            })
        })
    }
}

function removeExtraAttributes(view) {
    return view
        .delete('groupedFilters')
        .delete('dirty')
}


export function submitView(view, slug) {
    const data = removeExtraAttributes(view).toJS()
    const { id, newSlug } = data
    let url = '/api/views/'

    if (id) {
        url = `/api/views/${id}/`
    } else {
        data.order = 99
    }

    return (dispatch) => {
        dispatch({
            type: SUBMIT_VIEW_START,
            slug: slug || newSlug,
            data
        })

        return reqwest({
            url: url,
            data: JSON.stringify(data),
            type: 'json',
            method: 'PUT',
            contentType: 'application/json',
        }).then((resp) => {
            dispatch({
                type: SUBMIT_VIEW_SUCCESS,
                slug: newSlug,
                resp
            })
        }).catch((err) => {
            dispatch({
                type: SUBMIT_VIEW_ERROR,
                slug: newSlug,
                err
            })
        })
    }
}
