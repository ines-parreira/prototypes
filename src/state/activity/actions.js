import axios from 'axios'
import * as viewsTypes from '../views/constants'
import * as ticketActions from '../ticket/actions'
import * as types from './constants'

export const pollActivity = () => (dispatch, getState) => {
    const {activity, ticket} = getState()
    const loading = activity.get('loading')
    const pendingEvents = activity.get('pendingEvents').toJS()

    if (loading) {
        return dispatch({
            type: types.SUBMIT_ACTIVITY_DISCARD
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
                    type: viewsTypes.UPDATE_VIEW_LIST,
                    items: resp.views
                })
            }

            // Re-fetch the current ticket if it has something new
            resp.tickets.forEach((recentTicket) => {
                if (recentTicket.id === ticket.get('id') && recentTicket.has_something_new) {
                    dispatch(ticketActions.fetchTicket(recentTicket.id, false))
                }
            })
        })
        .catch(error => {
            dispatch({
                type: types.SUBMIT_ACTIVITY_ERROR
            })
            console.error('Failed polling activity', error)
        })
}
