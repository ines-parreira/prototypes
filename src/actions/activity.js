import axios from 'axios'
import {UPDATE_VIEW_LIST} from '../constants/view'
import * as types from '../constants/activity'

export function pollActivity(pendingEvents) {
    return (dispatch) => {
        dispatch({
            type: types.SUBMIT_ACTIVITY_START
        })

        axios.post('/api/activity/', pendingEvents.toJS())
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.SUBMIT_ACTIVITY_SUCCESS,
                    resp
                })

                if (resp.views) {
                    dispatch({
                        type: UPDATE_VIEW_LIST,
                        items: resp.views
                    })
                }
            })
            .catch(error => {
                console.error('Failed polling activity', error)
            })
    }
}
