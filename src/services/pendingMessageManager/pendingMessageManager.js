//@flow
import type {ContentState} from 'draft-js'
import {browserHistory} from 'react-router'
import {removeNotification} from 'reapop'

import {store as reduxStore} from '../../init'
import {
    newMessageResetFromMessage,
    sendTicketMessage,
} from '../../state/newMessage/actions.ts'
import {notify} from '../../state/notifications/actions.ts'
import {applyMacro, messageDeleted} from '../../state/ticket/actions.ts'
import {logEvent, EVENTS} from '../../store/middlewares/segmentTracker'

import type {SendMessageArgs} from './types'

const pendingMessageDelay = 5000

export class PendingMessageManager {
    pendingContentState: ?ContentState = null
    pendingMessageArgs: ?SendMessageArgs = null
    timeoutId: ?TimeoutID = null
    message: string

    constructor(message: string) {
        this.message = message
        window.addEventListener('beforeunload', this.handleBeforeUnload)
    }

    handleBeforeUnload = (e: *): ?string => {
        if (!this.timeoutId) {
            return
        }
        e.returnValue = this.message
        return this.message
    }

    reset = () => {
        window.removeEventListener('beforeunload', this.handleBeforeUnload)
    }

    sendMessage = (contentState: ContentState, ...args: SendMessageArgs) => {
        const [messageId] = args

        this.skipExistingTimer()
        reduxStore.dispatch(
            notify({
                id: messageId,
                status: 'success',
                message: 'Message sent',
                dismissAfter: pendingMessageDelay,
                buttons: [
                    {
                        name: 'Undo',
                        onClick: this.undoMessage,
                        primary: true,
                    },
                ],
            })
        )
        this.pendingContentState = contentState
        this.pendingMessageArgs = args
        this.timeoutId = setTimeout(() => {
            reduxStore.dispatch(sendTicketMessage(...args))
            this.timeoutId = null
        }, pendingMessageDelay)
    }

    clearMessage = () => {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId)
            this.timeoutId = null
        }
    }

    undoMessage = () => {
        if (this.timeoutId && this.pendingMessageArgs) {
            const [
                messageId,
                messageToSend,
                // eslint-disable-next-line no-unused-vars
                action,
                // eslint-disable-next-line no-unused-vars
                reset,
                ticketId,
            ] = this.pendingMessageArgs

            logEvent(EVENTS.UNDO_SENT_MESSAGE, {
                bodyText: messageToSend.body_text,
            })
            reduxStore.dispatch(removeNotification(messageId))
            reduxStore.dispatch(messageDeleted(messageId))
            browserHistory.push(`/app/ticket/${ticketId || ''}`)
            setTimeout(() => {
                const macros = messageToSend.macros || []
                const {macros: macrosState} = reduxStore.getState()

                reduxStore.dispatch(
                    newMessageResetFromMessage({
                        contentState: this.pendingContentState,
                        newMessage: messageToSend,
                    })
                )
                macros.map(({id}) => {
                    if (macrosState.get(id)) {
                        reduxStore.dispatch(
                            applyMacro(
                                macrosState.get(id),
                                parseInt(ticketId),
                                false
                            )
                        )
                    }
                })
            }, 0)
            this.clearMessage()
        }
    }

    skipExistingTimer = () => {
        if (this.timeoutId && this.pendingMessageArgs) {
            const [messageId, ...others] = this.pendingMessageArgs

            reduxStore.dispatch(removeNotification(messageId))
            reduxStore.dispatch(sendTicketMessage(messageId, ...others))
            this.clearMessage()
        }
    }
}

export default new PendingMessageManager(
    "Are you sure? Your message won't be sent"
)
