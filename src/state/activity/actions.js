// @flow
import axios from 'axios'
import {fromJS} from 'immutable'
import Push from 'push.js'

import * as constants from './constants'
import {playNotificationSound} from '../../utils'
import type {dispatchType, getStateType} from '../types'


export const pollChats = () => (dispatch: dispatchType, getState: getStateType): Promise<dispatchType> => {
    const {activity} = getState()

    const previousTickets = activity.get('tickets', fromJS([]))

    return axios.get('/api/activity/chats/', {timeout: 10000})
        .then((json = {}) => json.data)
        .then((resp = {}) => {
            dispatch({
                type: constants.SUBMIT_CHATS_SUCCESS,
                resp
            })

            const currentTickets = fromJS(resp.tickets || [])

            // comparing previous and current tickets from activity to trigger a notification if necessary
            const shouldNotify = currentTickets
                .filter(t => t.get('is_unread'))
                .some((currentTicket) => {
                    const previousTicket = previousTickets.find(t => t.get('id') === currentTicket.get('id'))
                    let isNew = false

                    if (!previousTicket) {
                        // the ticket was not there the previous time, it is a new one
                        isNew = true
                    } else if (!previousTicket.get('is_unread')) {
                        // the ticket had not got something new, but now it has
                        isNew = true
                    }

                    return isNew
                })

            if (shouldNotify) {
                playNotificationSound()
                Push.create('New activity on Gorgias', {
                    body: 'A ticket needs your attention',
                    timeout: 5000,
                    icon: `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/icons/logo.png`,
                    onClick: function () {
                        // send on helpdesk and close notification
                        window.focus()
                        this.close()
                    }
                })
            }
        }, (error) => {
            console.error('Failed polling chats', error)
            return dispatch({
                type: constants.SUBMIT_ACTIVITY_ERROR,
                error,
            })
        })
}
