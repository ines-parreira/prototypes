import client from '@repo/api-resources'
import { Duration, throttle } from '@gorgias/toolkit'
import type { RecentChatTicket } from '../../business/types/recentChats'
import type { Ticket } from '../../models/ticket/types'
import { browserNotification } from '../../services/browserNotification'
import type { StoreDispatch } from '../types'
import * as constants from './constants'

export const fetchChats =
    () =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .get<{ tickets: Ticket[] }>('/api/activity/chats/', {
                timeout: Duration.seconds(10),
            })
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
                },
            )
    }

export const fetchChatsThrottled = throttle((dispatch: StoreDispatch) => {
    void dispatch(fetchChats())
}, Duration.seconds(10))

export const addChat =
    (ticket: RecentChatTicket, notify = true, playSoundNotification = true) =>
    (dispatch: StoreDispatch) => {
        dispatch({
            type: constants.ADD_CHAT,
            ticket,
        })
        if (notify) {
            browserNotification.newMessageThrottled({
                title: ticket.customer.name,
                body: ticket.last_message_body_text || '',
                ticketId: ticket.id,
                playSoundNotification: playSoundNotification,
                requireInteraction: true,
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
