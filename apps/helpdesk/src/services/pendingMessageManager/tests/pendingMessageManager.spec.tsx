import { history } from '@repo/routing'
import { act, render, userEvent } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import {
    newMessageResetFromMessage,
    sendTicketMessage,
} from 'state/newMessage/actions'
import { applyMacro, messageDeleted } from 'state/ticket/actions'

import type { SendMessageArgs } from '../pendingMessageManager'
import {
    pendingMessageManager,
    PendingMessageManager,
} from '../pendingMessageManager'

Element.prototype.setPointerCapture = jest.fn()
Element.prototype.releasePointerCapture = jest.fn()

type fromJSType = typeof fromJS

jest.spyOn(window, 'addEventListener')
jest.spyOn(window, 'removeEventListener')
jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))
jest.mock('common/store', () => {
    const { fromJS } = jest.requireActual('immutable')
    return {
        store: {
            dispatch: jest.fn(),
            getState: () => ({
                macros: (fromJS as fromJSType)({ '1': { id: 1 } }),
            }),
        },
    }
})
jest.mock('state/newMessage/actions.ts')
jest.mock('state/ticket/actions')
jest.useFakeTimers()

describe('services', () => {
    describe('pendingMessageManager', () => {
        const actions = [
            {
                arguments: { tags: 'refund' },
                name: 'addTags',
                title: 'Add tags',
                type: 'user',
                status: 'pending',
            },
        ]

        const sendMessageArgs: SendMessageArgs = {
            messageId: 1,
            messageToSend: { actions: fromJS(actions) } as any,
            replyAreaState: {} as any,
            action: null,
            resetMessage: true,
            ticketId: '1',
        }

        const getSendTicketMessageCallArgs = (
            sendMessageArgs: SendMessageArgs,
        ): Parameters<typeof sendTicketMessage> => {
            const {
                messageId,
                messageToSend,
                action,
                resetMessage,
                ticketId,
                submissionContext,
            } = sendMessageArgs
            return [
                messageId,
                messageToSend,
                action,
                resetMessage,
                ticketId,
                submissionContext,
            ]
        }

        it('should send deferred message', () => {
            pendingMessageManager.sendMessage(sendMessageArgs)
            act(() => {
                jest.runAllTimers()
            })
            expect(sendTicketMessage).toHaveBeenNthCalledWith(
                1,
                ...getSendTicketMessageCallArgs(sendMessageArgs),
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
                ...getSendTicketMessageCallArgs(sendMessageArgs),
            )
            act(() => {
                jest.runAllTimers()
            })
            expect(sendTicketMessage).toHaveBeenNthCalledWith(
                2,
                ...getSendTicketMessageCallArgs(secondSendMessageArgs),
            )
        })

        it('should not send the message when clearing the message', () => {
            pendingMessageManager.sendMessage(sendMessageArgs)
            pendingMessageManager.clearMessage()

            act(() => {
                jest.runAllTimers()
            })
            expect(sendTicketMessage).not.toHaveBeenCalled()
        })

        it('should display a toast with undo button when sending a message', async () => {
            render(<div />)
            pendingMessageManager.sendMessage(sendMessageArgs)

            await waitFor(() => {
                const toastEl = screen.getByRole('status')
                expect(toastEl).toHaveTextContent('Message sent')
                expect(toastEl).toHaveAttribute('data-intent', 'success')
                expect(
                    screen.getByRole('button', { name: 'Undo' }),
                ).toBeInTheDocument()
            })
        })

        it('should remove the pending message and redirect to the ticket when undoing the message', async () => {
            const { messageToSend, replyAreaState } = sendMessageArgs
            render(<div />)
            pendingMessageManager.sendMessage(sendMessageArgs)

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: 'Undo' }),
                ).toBeInTheDocument()
            })

            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            await user.click(screen.getByRole('button', { name: 'Undo' }))

            expect(messageDeleted).toHaveBeenNthCalledWith(1, 1)
            expect(history.push).toHaveBeenNthCalledWith(1, '/app/ticket/1')
            act(() => {
                jest.runAllTimers()
            })
            expect(newMessageResetFromMessage).toHaveBeenNthCalledWith(1, {
                replyAreaState,
                newMessage: messageToSend,
            })
        })

        it('should apply macro when undoing a message using macro', async () => {
            render(<div />)
            pendingMessageManager.sendMessage(sendMessageArgs)

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: 'Undo' }),
                ).toBeInTheDocument()
            })

            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            await user.click(screen.getByRole('button', { name: 'Undo' }))

            act(() => {
                jest.runAllTimers()
            })
            expect(applyMacro).toHaveBeenNthCalledWith(
                1,
                fromJS({ actions }),
                1,
                false,
            )
        })

        it('should send the message immediately when skipping the timer', () => {
            pendingMessageManager.sendMessage(sendMessageArgs)
            pendingMessageManager.skipExistingTimer()

            expect(sendTicketMessage).toHaveBeenNthCalledWith(
                1,
                ...getSendTicketMessageCallArgs(sendMessageArgs),
            )
        })

        it('should prevent redirection when a message is pending', () => {
            const newPendingMessageManager = new PendingMessageManager('foo')
            expect(window.addEventListener).not.toHaveBeenCalled()
            newPendingMessageManager.sendMessage(sendMessageArgs)
            expect(window.addEventListener).toHaveBeenNthCalledWith(
                1,
                'beforeunload',
                newPendingMessageManager.handleBeforeUnload,
            )
        })

        it('should remove redirection handler when skipExistingTimer is called', () => {
            const newPendingMessageManager = new PendingMessageManager('foo')
            newPendingMessageManager.sendMessage(sendMessageArgs)
            newPendingMessageManager.skipExistingTimer()
            expect(window.removeEventListener).toHaveBeenNthCalledWith(
                1,
                'beforeunload',
                newPendingMessageManager.handleBeforeUnload,
            )
        })
    })
})
