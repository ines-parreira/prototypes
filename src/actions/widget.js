import reqwest from 'reqwest'
import { systemMessage } from './systemMessage'


// Fetching a list of tickets life-cycle
export const FETCH_WIDGETS_START = 'FETCH_WIDGETS_START'
export const FETCH_WIDGETS_SUCCESS = 'FETCH_WIDGETS_SUCCESS'


export function fetchWidgets(data = {}, type = 'ticket') {
    const url = '/widgets/'

    return (dispatch) => {
        dispatch({
            type: FETCH_WIDGETS_START
        })

        return reqwest({
            url: url,
            type: 'json',
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: FETCH_WIDGETS_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: Failed to fetch widgets.',
                msg: err.toString()
            }))
        })
    }
}

