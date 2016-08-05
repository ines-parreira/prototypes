import axios from 'axios'
import * as types from '../constants/widget'

export function fetchWidgets() {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_WIDGETS_START
        })

        return axios.get('/api/widgets/', {
            data: {
                type: 'ticket-list'
            }
        })
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_WIDGETS_SUCCESS,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.FETCH_WIDGETS_ERROR,
                    error,
                    reason: 'Failed to fetch widgets'
                })
            })
    }
}

