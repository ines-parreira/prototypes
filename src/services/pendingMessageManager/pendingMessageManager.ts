import {removeNotification} from 'reapop'
import {EnhancedStore} from '@reduxjs/toolkit'

import {store as reduxStore} from '../../init'
import {
    newMessageResetFromMessage,
    sendTicketMessage,
} from '../../state/newMessage/actions'
import {notify} from '../../state/notifications/actions'
import {NotificationStatus} from '../../state/notifications/types'
import {applyMacro, messageDeleted} from '../../state/ticket/actions'
import {logEvent, SegmentEvent} from '../../store/middlewares/segmentTracker'
import {RootState} from '../../state/types'
import history from '../../pages/history'
import {NewMessage, ReplyAreaState} from '../../state/newMessage/types'

//$TsFixMe remove once init.js is migrated
const typeSafeReduxStore = reduxStore as EnhancedStore

const pendingMessageDelay = 5000

export type SendMessageArgs = {
    messageId: number
    messageToSend: NewMessage
    replyAreaState: ReplyAreaState
    action: Maybe<string>
    resetMessage: boolean
    ticketId: Maybe<string>
}

export class PendingMessageManager {
    pendingSendMessagesArgs: SendMessageArgs | null = null
    timeoutId: Maybe<number> = null
    message: string

    constructor(message: string) {
        this.message = message
        window.addEventListener('beforeunload', this.handleBeforeUnload)
    }

    handleBeforeUnload = (e: BeforeUnloadEvent): Maybe<string> => {
        if (!this.timeoutId) {
            return
        }
        e.returnValue = this.message
        return this.message
    }

    reset = () => {
        window.removeEventListener('beforeunload', this.handleBeforeUnload)
    }

    sendMessage = (sendMessageArgs: SendMessageArgs) => {
        const {messageId, messageToSend, action, resetMessage, ticketId} =
            sendMessageArgs

        this.skipExistingTimer()
        typeSafeReduxStore.dispatch(
            notify({
                id: messageId as any,
                status: NotificationStatus.Success,
                message: 'Message sent',
                dismissAfter: pendingMessageDelay,
                buttons: [
                    {
                        name: 'Undo',
                        onClick: this.undoMessage,
                        primary: true,
                    },
                ],
                //$TsFixMe remove casting on init.js migration
            }) as any
        )
        this.pendingSendMessagesArgs = sendMessageArgs
        this.timeoutId = window.setTimeout(() => {
            //$TsFixMe remove casting on init.js migration
            typeSafeReduxStore.dispatch(
                sendTicketMessage(
                    messageId,
                    messageToSend,
                    action,
                    resetMessage,
                    ticketId
                ) as any
            )
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
        if (this.timeoutId && this.pendingSendMessagesArgs) {
            const {messageId, messageToSend, ticketId, replyAreaState} =
                this.pendingSendMessagesArgs

            logEvent(SegmentEvent.UndoSentMessage, {
                bodyText: messageToSend.body_text,
            })
            //eslint-disable-next-line @typescript-eslint/no-unsafe-call
            typeSafeReduxStore.dispatch(removeNotification(messageId))
            typeSafeReduxStore.dispatch(messageDeleted(messageId as any))
            history.push(`/app/ticket/${ticketId || ''}`)
            setTimeout(() => {
                const macros = messageToSend.macros || []
                const {macros: macrosState} =
                    typeSafeReduxStore.getState() as RootState

                typeSafeReduxStore.dispatch(
                    newMessageResetFromMessage({
                        replyAreaState,
                        newMessage: messageToSend,
                    })
                )
                macros.map(({id}) => {
                    if (macrosState.get(id)) {
                        //$TsFixMe remove casting on init.js migration
                        typeSafeReduxStore.dispatch(
                            applyMacro(
                                macrosState.get(id),
                                parseInt(ticketId as any),
                                false
                            ) as any
                        )
                    }
                })
            }, 0)
            this.clearMessage()
        }
    }

    skipExistingTimer = () => {
        if (this.timeoutId && this.pendingSendMessagesArgs) {
            const {messageId, messageToSend, action, resetMessage, ticketId} =
                this.pendingSendMessagesArgs

            //eslint-disable-next-line @typescript-eslint/no-unsafe-call
            typeSafeReduxStore.dispatch(removeNotification(messageId))
            //$TsFixMe remove casting on init.js migration
            typeSafeReduxStore.dispatch(
                sendTicketMessage(
                    messageId,
                    messageToSend,
                    action,
                    resetMessage,
                    ticketId
                ) as any
            )
            this.clearMessage()
        }
    }
}

export default new PendingMessageManager(
    "Are you sure? Your message won't be sent"
)
