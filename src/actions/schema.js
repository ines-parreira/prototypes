import reqwest from 'reqwest'
import {systemMessage} from './systemMessage.js'

export const FETCH_SCHEMAS_START = 'FETCH_SCHEMAS_START'
export const FETCH_SCHEMAS_SUCCESS = 'FETCH_SCHEMAS_SUCCESS'

export function fetch() {
    return (dispatch) => {
        dispatch({
            type: FETCH_SCHEMAS_START
        })

        return reqwest({
            url: '/api/schemas/',
            type: 'json',
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: FETCH_SCHEMAS_SUCCESS,
                data: resp.objects
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: Failed to fetch schemas.',
                msg: err
            }))
        })
    }
}
