import reqwest from 'reqwest'
import {UPDATE_VIEW_LIST} from './view'

export const SUBMIT_ACTIVITY_START = 'SUBMIT_ACTIVITY_START'
export const SUBMIT_ACTIVITY_SUCCESS = 'SUBMIT_ACTIVITY_SUCCESS'
export const TICKET_VIEWED = 'TICKET_VIEWED'

export function pollActivity(pendingEvents) {
    return (dispatch) => {
        dispatch({
            type: SUBMIT_ACTIVITY_START
        })

        return reqwest({
            url: '/api/activity/',
            type: 'json',
            method: 'POST',
            data: JSON.stringify(pendingEvents.toJS()),
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: SUBMIT_ACTIVITY_SUCCESS,
                resp
            })
            if (resp.views) {
                dispatch({
                    type: UPDATE_VIEW_LIST,
                    items: resp.views
                })
            }
        }).catch((err) => {
            console.error('Failed polling activity', err)
        })
    }
}
