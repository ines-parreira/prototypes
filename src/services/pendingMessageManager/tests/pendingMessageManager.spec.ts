import {fromJS} from 'immutable'
import {browserHistory} from 'react-router'
import {removeNotification} from 'reapop'

import {
    newMessageResetFromMessage,
    sendTicketMessage,
} from '../../../state/newMessage/actions'
import {applyMacro, messageDeleted} from '../../../state/ticket/actions'
import pendingMessageManager, {
    PendingMessageManager,
    SendMessageArgs,
} from '../pendingMessageManager'

type fromJSType = typeof fromJS

jest.spyOn(window, 'addEventListener')
jest.spyOn(window, 'removeEventListener')
jest.mock('react-router')
jest.mock('reapop')
jest.mock('../../../init', () => {
    const {fromJS} = require.requireActual('immutable')
    return {
        store: {
            dispatch: jest.fn(),
            getState: () => ({
                macros: (fromJS as fromJSType)({'1': {id: 1}}),
            }),
        },
    }
})
jest.mock('../../../state/newMessage/actions.ts')
jest.mock('../../../state/notifications/actions.ts')
jest.mock('../../../state/ticket/actions.ts')
jest.useFakeTimers()

describe('services', () => {
    describe('pendingMessageManager', () => {
        const sendMessageArgs: SendMessageArgs = {
            messageId: 1,
            messageToSend: {} as any,
            replyAreaState: {} as any,
            action: null,
            resetMessage: true,
            ticketId: '1',
        }

        const getSendTicketMessageCallArgs = (
            sendMessageArgs: SendMessageArgs
        ): Parameters<typeof sendTicketMessage> => {
            const {
                messageId,
                messageToSend,
                action,
                resetMessage,
                ticketId,
            } = sendMessageArgs
            return [messageId, messageToSend, action, resetMessage, ticketId]
        }

        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should send deferred message', () => {
            pendingMessageManager.sendMessage(sendMessageArgs)
            jest.runAllTimers()
            expect(sendTicketMessage).toHaveBeenNthCalledWith(
                1,
                ...getSendTicketMessageCallArgs(sendMessageArgs)
            )
        })

        it('should send the pending message when sending a new message', () => {
            const secondSendMessageArgs: SendMessageArgs = {
                ...sendMessageArgs,
                messageId: 2,
            }
            pendingMessageManager.sendMessage(sendMessageArgs)
            pendingMessageManager.sendMessage(secondSendMessageArgs)

            expect(sendTicketMessage).toHaveBeenNthCalledWith(
                1,
                ...getSendTicketMessageCallArgs(sendMessageArgs)
            )
            jest.runAllTimers()
            expect(sendTicketMessage).toHaveBeenNthCalledWith(
                2,
                ...getSendTicketMessageCallArgs(secondSendMessageArgs)
            )
        })

        it('should not send the message when clearing the message', () => {
            pendingMessageManager.sendMessage(sendMessageArgs)
            pendingMessageManager.clearMessage()

            jest.runAllTimers()
            expect(sendTicketMessage).not.toHaveBeenCalled()
        })

        it('should remove the pending message and redirect to the ticket when undoing the message', () => {
            const {messageToSend, replyAreaState} = sendMessageArgs
            pendingMessageManager.sendMessage(sendMessageArgs)
            pendingMessageManager.undoMessage()

            expect(removeNotification).toHaveBeenNthCalledWith(1, 1)
            expect(messageDeleted).toHaveBeenNthCalledWith(1, 1)
            expect(browserHistory.push).toHaveBeenNthCalledWith(
                1,
                '/app/ticket/1'
            )
            jest.runAllTimers()
            expect(newMessageResetFromMessage).toHaveBeenNthCalledWith(1, {
                replyAreaState,
                newMessage: messageToSend,
            })
        })

        it('should apply macro when undoing a message using macro', () => {
            const args: SendMessageArgs = {
                ...sendMessageArgs,
                messageToSend: {macros: [{id: '1'}]} as any,
            }
            pendingMessageManager.sendMessage(args)
            pendingMessageManager.undoMessage()

            jest.runAllTimers()
            expect(applyMacro).toHaveBeenNthCalledWith(
                1,
                fromJS({id: 1}),
                1,
                false
            )
        })

        it('should send the message immediately when skipping the timer', () => {
            pendingMessageManager.sendMessage(sendMessageArgs)
            pendingMessageManager.skipExistingTimer()

            expect(sendTicketMessage).toHaveBeenNthCalledWith(
                1,
                ...getSendTicketMessageCallArgs(sendMessageArgs)
            )
        })

        it('should prevent redirection when a message is pending', () => {
            const newPendingMessageManager = new PendingMessageManager('foo')
            const beforeUnloadHandler = (window.addEventListener as jest.MockedFunction<
                typeof window.addEventListener
            >).mock.calls[0][1] as (event: BeforeUnloadEvent) => void
            const event = new Event('beforeUnload')

            expect(beforeUnloadHandler(event)).toBe(undefined)
            newPendingMessageManager.sendMessage(sendMessageArgs)
            expect(beforeUnloadHandler(event)).toBe('foo')
        })

        it('should remove redirection handler when reset', () => {
            const newPendingMessageManager = new PendingMessageManager('foo')
            newPendingMessageManager.reset()

            expect(window.removeEventListener).toHaveBeenNthCalledWith(
                1,
                'beforeunload',
                newPendingMessageManager.handleBeforeUnload
            )
        })
    })
})
