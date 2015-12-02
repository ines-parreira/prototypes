import reqwest from 'reqwest'

// Basic operations on the views
export const NEW_VIEW = 'NEW_VIEW'

// Fetch individual view definitions
export const FETCH_VIEW_START = 'FETCH_VIEW_START'
export const FETCH_VIEW_FINISH = 'FETCH_VIEW_FINISH'

// Fetch list views
export const FETCH_VIEW_LIST_START = 'FETCH_VIEW_LIST_START'
export const FETCH_VIEW_LIST_FINISH = 'FETCH_VIEW_LIST_FINISH'

export function fetchView(url, type = 'list') {
    return (dispatch) => {
        dispatch({
            type: type === 'list' ? FETCH_VIEW_LIST_START : FETCH_VIEW_START
        })

        return reqwest({
            url: url,
            type: 'json',
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: type === 'list' ? FETCH_VIEW_LIST_FINISH : FETCH_VIEW_FINISH,
                resp
            })
        })
    }
}
