import axios from 'axios'
import {fetchPage} from '../views/actions'
import * as viewsTypes from '../views/constants'
import * as types from './constants'

export const pollActivity = () => (dispatch, getState) => {
    const {activity, views} = getState()

    const isFetchingView = views.getIn(['_internal', 'loading', 'fetchList'], false)
        || views.getIn(['_internal', 'loading', 'fetchListDiscreet'], false)

    // don't fetch view if it is currently fetching
    if (!isFetchingView) {
        const isEdited = views.getIn(['active', 'editMode'], false)

        if (!isEdited) {
            dispatch(fetchPage(null, true))
        }
    }

    const finished = activity.get('finished')
    const pendingEvents = activity.get('pendingEvents').toJS()

    // don't send activity again if previous one is not done
    if (!finished) {
        return dispatch({
            type: types.SUBMIT_ACTIVITY_DISCARD
        })
    }

    dispatch({
        type: types.SUBMIT_ACTIVITY_START
    })

    return axios.post('/api/activity/', pendingEvents, {timeout: 10000})
        .then((json = {}) => json.data)
        .then((resp = {}) => {
            dispatch({
                type: types.SUBMIT_ACTIVITY_SUCCESS,
                resp
            })

            if (resp.views) {
                dispatch({
                    type: viewsTypes.UPDATE_VIEW_LIST,
                    items: resp.views
                })
            }
        })
        .catch(error => {
            console.error('Failed polling activity', error)
            return dispatch({
                type: types.SUBMIT_ACTIVITY_ERROR,
                error,
            })
        })
}
