import axios from 'axios'
import {UPDATE_VIEW_LIST} from '../views/constants'
import * as types from './constants'

export const pollActivity = () => (dispatch, getState) => {
    const {activity} = getState()
    const finished = activity.get('finished')
    const pendingEvents = activity.get('pendingEvents').toJS()

    if (!finished) {
        return dispatch({
            type: 'NOOP'
        })
    }

    dispatch({
        type: types.SUBMIT_ACTIVITY_START
    })

    return axios.post('/api/activity/', pendingEvents, {timeout: 10000})
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
            dispatch({
                type: types.SUBMIT_ACTIVITY_ERROR
            })
            console.error('Failed polling activity', error)
        })
}
