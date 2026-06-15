import type { EnhancedStore } from '@reduxjs/toolkit'
import { logEvent, SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import { fromJS } from 'immutable'
import { Duration } from '@gorgias/toolkit'

import { Button, toast } from '@gorgias/axiom'

import { store as reduxStore } from 'common/store'
import {
    newMessageResetFromMessage,
    sendTicketMessage,
} from 'state/newMessage/actions'
import {
    getBrowserTicketSubmissionDiagnostics,
    getTicketMessageDiagnostics,
    haveDifferentTicketIds,
    reportTicketMessageSubmissionIdentityMismatch,
} from 'state/newMessage/ticketSubmissionDiagnostics'
import type {
    TicketMessageSubmissionDiagnosticsContext,
    TicketMessageSubmissionDiagnosticsStage,
} from 'state/newMessage/ticketSubmissionDiagnostics'
import type { NewMessage, ReplyAreaState } from 'state/newMessage/types'
import { applyMacro, messageDeleted } from 'state/ticket/actions'

//$TsFixMe remove once init.js is migrated
const typeSafeReduxStore = reduxStore as EnhancedStore

const pendingMessageDelay = Duration.seconds(5)

export type SendMessageArgs = {
    messageId: number
    messageToSend: NewMessage
    replyAreaState: ReplyAreaState
    action: Maybe<string>
    resetMessage: boolean
    ticketId: Maybe<string>
    submissionContext?: TicketMessageSubmissionDiagnosticsContext
}

export class PendingMessageManager {
    pendingSendMessagesArgs: SendMessageArgs | null = null
    timeoutId: Maybe<number> = null
    message: string

    constructor(message: string) {
        this.message = message
    }

    handleBeforeUnload = (e: BeforeUnloadEvent): Maybe<string> => {
        if (!this.timeoutId) {
            return
        }
        e.returnValue = this.message
        return this.message
    }

    listenUnloadEvent = () => {
        window.addEventListener('beforeunload', this.handleBeforeUnload)
    }

    dismissUnloadListener = () => {
        window.removeEventListener('beforeunload', this.handleBeforeUnload)
    }

    reportPendingMessageMismatch = (
        stage: TicketMessageSubmissionDiagnosticsStage,
        sendMessageArgs: SendMessageArgs,
    ) => {
        const { action, messageId, messageToSend, resetMessage, ticketId } =
            sendMessageArgs

        if (!haveDifferentTicketIds(messageToSend.ticket_id, ticketId)) {
            return
        }

        const state = typeSafeReduxStore.getState() as {
            ticket?: { get?: (key: string) => unknown }
        }

        reportTicketMessageSubmissionIdentityMismatch(stage, {
            ...getBrowserTicketSubmissionDiagnostics(),
            ...sendMessageArgs.submissionContext,
            ...getTicketMessageDiagnostics(messageToSend),
            ticket_id_submitted: ticketId,
            ticket_id_redux: state.ticket?.get?.('id'),
            message_id: messageId,
            action,
            reset_message: resetMessage,
        })
    }

    sendMessage = (sendMessageArgs: SendMessageArgs) => {
        const { messageId, messageToSend, action, resetMessage, ticketId } =
            sendMessageArgs

        this.skipExistingTimer()
        this.reportPendingMessageMismatch(
            'pending_send_scheduled',
            sendMessageArgs,
        )
        toast.success('Message sent', {
            id: String(messageId),
            inlineActions: (
                <Button size="sm" variant="tertiary" onClick={this.undoMessage}>
                    Undo
                </Button>
            ),
        })
        this.pendingSendMessagesArgs = sendMessageArgs
        this.listenUnloadEvent()
        this.timeoutId = window.setTimeout(() => {
            this.reportPendingMessageMismatch(
                'pending_send_timeout',
                sendMessageArgs,
            )
            //$TsFixMe remove casting on init.js migration
            typeSafeReduxStore.dispatch(
                sendTicketMessage(
                    messageId,
                    messageToSend,
                    action,
                    resetMessage,
                    ticketId,
                    sendMessageArgs.submissionContext,
                ) as any,
            )
            this.dismissUnloadListener()
            this.timeoutId = null
        }, pendingMessageDelay)
    }

    clearMessage = () => {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId)
            this.dismissUnloadListener()
            this.timeoutId = null
        }
    }

    undoMessage = () => {
        if (this.timeoutId && this.pendingSendMessagesArgs) {
            const { messageId, messageToSend, ticketId, replyAreaState } =
                this.pendingSendMessagesArgs

            logEvent(SegmentEvent.UndoSentMessage, {
                bodyText: messageToSend.body_text,
            })
            toast.dismiss(String(messageId))
            typeSafeReduxStore.dispatch(messageDeleted(messageId as any))
            history.push(`/app/ticket/${ticketId || ''}`)
            setTimeout(() => {
                typeSafeReduxStore.dispatch(
                    newMessageResetFromMessage({
                        replyAreaState,
                        newMessage: messageToSend,
                    }),
                )
                if (messageToSend.actions) {
                    const macro = fromJS({ actions: messageToSend.actions })
                    typeSafeReduxStore.dispatch(
                        applyMacro(
                            macro,
                            parseInt(ticketId as any),
                            false,
                        ) as any,
                    )
                }
            }, 0)
            this.clearMessage()
        }
    }

    skipExistingTimer = () => {
        if (this.timeoutId && this.pendingSendMessagesArgs) {
            const {
                messageId,
                messageToSend,
                action,
                resetMessage,
                ticketId,
                submissionContext,
            } = this.pendingSendMessagesArgs

            this.reportPendingMessageMismatch(
                'pending_send_flushed',
                this.pendingSendMessagesArgs,
            )
            toast.dismiss(String(messageId))
            //$TsFixMe remove casting on init.js migration
            typeSafeReduxStore.dispatch(
                sendTicketMessage(
                    messageId,
                    messageToSend,
                    action,
                    resetMessage,
                    ticketId,
                    submissionContext,
                ) as any,
            )
            this.clearMessage()
        }
    }
}

const pendingMessageManager = new PendingMessageManager(
    "Are you sure? Your message won't be sent",
)

export { pendingMessageManager }
