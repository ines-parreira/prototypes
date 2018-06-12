// @flow
import axios from 'axios'
import browserNotification from '../../services/browserNotification'

import * as constants from './constants'
import type {dispatchType} from '../types'
import _throttle from 'lodash/throttle'

export const fetchChats = () => (dispatch: dispatchType): Promise<dispatchType> => {
    return axios.get('/api/activity/chats/', {timeout: 10000})
        .then((json = {}) => json.data)
        .then((resp = {}) => {
            dispatch(setChats(resp.tickets))
        }, (error) => {
            console.error('Failed to fetch chats', error)
            return dispatch({
                type: constants.FETCH_CHATS_ERROR,
                error,
            })
        })
}

export const fetchChatsThrottled = _throttle((dispatch: dispatchType) => {
    dispatch(fetchChats())
}, 10000)

export const addChat = (ticket: Object, notify: boolean = true) => (dispatch: dispatchType) => {
    dispatch({
        type: constants.ADD_CHAT,
        ticket: ticket
    })
    // TODO(customers-migration): use `customer_name` and `customer_email`
    if (notify) {
        browserNotification.newMessage({
            title: ticket.requester_name,
            body: ticket.last_message_body_text,
            ticketId: ticket.id
        })
    }
}

export const setChats = (tickets: Array<Object>) => ({
    type: constants.SET_CHATS,
    tickets
})
export const removeChat = (ticketId: string) => ({
    type: constants.REMOVE_CHAT,
    ticketId: ticketId
})

export const markChatAsRead = (ticketId: string | number) => ({
    type: constants.MARK_CHAT_AS_READ,
    ticketId: ticketId
})
