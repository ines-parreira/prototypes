import {ContentState} from 'draft-js'
import {fromJS} from 'immutable'
import {removeNotification} from 'reapop'

import {
    newMessageResetFromMessage,
    sendTicketMessage,
} from '../../../state/newMessage/actions'
import {applyMacro, messageDeleted} from '../../../state/ticket/actions'
import history from '../../../pages/history'
import pendingMessageManager, {
    PendingMessageManager,
} from '../pendingMessageManager'
import {SendMessageArgs} from '../types'

type fromJSType = typeof fromJS

jest.spyOn(window, 'addEventListener')
jest.spyOn(window, 'removeEventListener')
jest.mock('react-router-dom')
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
    const emptyContentState = ContentState.createFromText('')
    describe('pendingMessageManager', () => {
        const sendMessageArgs: SendMessageArgs = [1, {}, null, true, '1'] as any
        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should send deferred message', () => {
            pendingMessageManager.sendMessage(
                emptyContentState,
                ...sendMessageArgs
            )

            jest.runAllTimers()
            expect(sendTicketMessage).toHaveBeenNthCalledWith(
                1,
                ...sendMessageArgs
            )
        })

        it('should send the pending message when sending a new message', () => {
            const secondSendMessageArgs: SendMessageArgs = [
                2,
                {},
                null,
                true,
                '1',
            ] as any
            pendingMessageManager.sendMessage(
                emptyContentState,
                ...sendMessageArgs
            )
            pendingMessageManager.sendMessage(
                emptyContentState,
                ...secondSendMessageArgs
            )

            expect(sendTicketMessage).toHaveBeenNthCalledWith(
                1,
                ...sendMessageArgs
            )
            jest.runAllTimers()
            expect(sendTicketMessage).toHaveBeenNthCalledWith(
                2,
                ...secondSendMessageArgs
            )
        })

        it('should not send the message when clearing the message', () => {
            pendingMessageManager.sendMessage(
                emptyContentState,
                ...sendMessageArgs
            )
            pendingMessageManager.clearMessage()

            jest.runAllTimers()
            expect(sendTicketMessage).not.toHaveBeenCalled()
        })

        it('should remove the pending message and redirect to the ticket when undoing the message', () => {
            pendingMessageManager.sendMessage(
                emptyContentState,
                ...sendMessageArgs
            )
            pendingMessageManager.undoMessage()

            expect(removeNotification).toHaveBeenNthCalledWith(1, 1)
            expect(messageDeleted).toHaveBeenNthCalledWith(1, 1)
            expect(history.push).toHaveBeenNthCalledWith(1, '/app/ticket/1')
            jest.runAllTimers()
            expect(newMessageResetFromMessage).toHaveBeenNthCalledWith(1, {
                contentState: emptyContentState,
                newMessage: sendMessageArgs[1],
            })
        })

        it('should apply macro when undoing a message using macro', () => {
            const args: SendMessageArgs = [...sendMessageArgs]
            args[1] = {macros: [{id: '1'}]} as any
            pendingMessageManager.sendMessage(emptyContentState, ...args)
            pendingMessageManager.undoMessage()

            jest.runAllTimers()
            expect(applyMacro).toHaveBeenNthCalledWith(
                1,
                fromJS({id: 1}),
                1,
                false
            )
        })

        it('should send the message immediatly when skipping the timer', () => {
            pendingMessageManager.sendMessage(
                emptyContentState,
                ...sendMessageArgs
            )
            pendingMessageManager.skipExistingTimer()

            expect(sendTicketMessage).toHaveBeenNthCalledWith(
                1,
                ...sendMessageArgs
            )
        })

        it('should prevent redirection when a message is pending', () => {
            const newPendingMessageManager = new PendingMessageManager('foo')
            const beforeUnloadHandler = (window.addEventListener as jest.MockedFunction<
                typeof window.addEventListener
            >).mock.calls[0][1] as (event: BeforeUnloadEvent) => void
            const event = new Event('beforeUnload')

            expect(beforeUnloadHandler(event)).toBe(undefined)
            newPendingMessageManager.sendMessage(
                emptyContentState,
                ...sendMessageArgs
            )
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
