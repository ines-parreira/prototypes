// @flow
import axios from 'axios'
import _throttle from 'lodash/throttle'

import browserNotification from '../../services/browserNotification'

import type {RecentChatTicket} from '../../business/types/recentChats'
import type {dispatchType} from '../types'

import * as constants from './constants'

export const fetchChats = () => (
    dispatch: dispatchType
): Promise<dispatchType> => {
    return axios
        .get('/api/activity/chats/', {timeout: 10000})
        .then((json = {}) => json.data)
        .then(
            (resp = {}) => {
                dispatch(setChats(resp.tickets))
            },
            (error) => {
                console.error('Failed to fetch chats', error)
                return dispatch({
                    type: constants.FETCH_CHATS_ERROR,
                    error,
                })
            }
        )
}

export const fetchChatsThrottled = _throttle((dispatch: dispatchType) => {
    dispatch(fetchChats())
}, 10000)

export const addChat = (ticket: RecentChatTicket, notify: boolean = true) => (
    dispatch: dispatchType
) => {
    dispatch({
        type: constants.ADD_CHAT,
        ticket: ticket,
    })
    if (notify) {
        browserNotification.newMessage({
            title: ticket.customer.name,
            body: ticket.last_message_body_text || '',
            ticketId: ticket.id,
        })
    }
}

export const setChats = (tickets: Array<Object>) => ({
    type: constants.SET_CHATS,
    tickets,
})
export const removeChat = (ticketId: number) => ({
    type: constants.REMOVE_CHAT,
    ticketId: ticketId,
})

export const markChatAsRead = (ticketId: number) => ({
    type: constants.MARK_CHAT_AS_READ,
    ticketId: ticketId,
})
