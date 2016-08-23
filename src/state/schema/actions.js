import axios from 'axios'
import * as types from './constants'

export function fetch() {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_SCHEMAS_START
        })

        return axios.get('/doc/openapi.json')
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_SCHEMAS_SUCCESS,
                    data: resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.FETCH_SCHEMAS_ERROR,
                    error,
                    reason: 'Failed to fetch schemas'
                })
            })
    }
}
