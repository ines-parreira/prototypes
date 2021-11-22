import _throttle from 'lodash/throttle'

import browserNotification from '../../services/browserNotification'

import {RecentChatTicket} from '../../business/types/recentChats'
import {Ticket} from '../../models/ticket/types'
import {StoreDispatch} from '../types'
import client from '../../models/api/resources'

import * as constants from './constants.js'

export const fetchChats =
    () =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .get<{tickets: Ticket[]}>('/api/activity/chats/', {timeout: 10000})
            .then((json) => json?.data)
            .then(
                (resp) => {
                    dispatch(setChats(resp?.tickets))
                },
                (error) => {
                    return dispatch({
                        type: constants.FETCH_CHATS_ERROR,
                        error,
                    })
                }
            )
    }

export const fetchChatsThrottled = _throttle((dispatch: StoreDispatch) => {
    void dispatch(fetchChats())
}, 10000)

export const addChat =
    (ticket: RecentChatTicket, notify = true, playSoundNotification = true) =>
    (dispatch: StoreDispatch) => {
        dispatch({
            type: constants.ADD_CHAT,
            ticket,
        })
        if (notify) {
            browserNotification.newMessage({
                title: ticket.customer.name,
                body: ticket.last_message_body_text || '',
                ticketId: ticket.id,
                playSoundNotification: playSoundNotification,
            })
        }
    }

export const setChats = (tickets: Ticket[]) => ({
    type: constants.SET_CHATS,
    tickets,
})
export const removeChat = (ticketId: number) => ({
    type: constants.REMOVE_CHAT,
    ticketId,
})

export const markChatAsRead = (ticketId: number) => ({
    type: constants.MARK_CHAT_AS_READ,
    ticketId,
})

export const markChatAsUnread = (ticketId: number) => ({
    type: constants.MARK_CHAT_AS_UNREAD,
    ticketId,
})
