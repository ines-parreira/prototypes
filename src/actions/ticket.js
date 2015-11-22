import reqwest from 'reqwest'
import * as constants from '../constants/ticket'

export function fetchView(url) {
    return (dispatch) => {
        dispatch({
           type: constants.FETCH_TICKET_LIST_VIEW_START
        })

        return reqwest({
            url: url,
            type: 'json',
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: constants.FETCH_TICKET_LIST_VIEW_FINISH,
                resp
            })
        })
    }
}
