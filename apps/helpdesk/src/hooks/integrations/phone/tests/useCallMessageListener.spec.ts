import { renderHook } from '@repo/testing'
import { Call } from '@twilio/voice-sdk'
import { EventEmitter } from 'events'

import { useCallMessageListener } from '../useCallMessageListener'

describe('useCallMessageListener', () => {
    const call: EventEmitter = new EventEmitter()

    it('should call callback when message is received', () => {
        const onMessage = jest.fn()

        renderHook(() => useCallMessageListener(call as Call, onMessage))

        const twilioMessage = {
            type: 'event-happened',
            data: { id: '123' },
        }

        call.emit('messageReceived', { content: twilioMessage })

        expect(onMessage).toHaveBeenCalledWith(twilioMessage)
        expect(onMessage).toHaveBeenCalledTimes(1)
    })

    it('should call latest callback without re-registering listener when callback changes', () => {
        const onMessage = jest.fn()
        const newOnMessage = jest.fn()

        const { rerender } = renderHook(
            ({ callback }) => useCallMessageListener(call as Call, callback),
            { initialProps: { callback: onMessage } },
        )

        const twilioMessage = {
            type: 'event-happened',
            data: { id: '123' },
        }

        call.emit('messageReceived', { content: twilioMessage })
        expect(onMessage).toHaveBeenCalledWith(twilioMessage)
        expect(newOnMessage).not.toHaveBeenCalled()

        rerender({ callback: newOnMessage })

        call.emit('messageReceived', { content: twilioMessage })
        expect(onMessage).toHaveBeenCalledTimes(1)
        expect(newOnMessage).toHaveBeenCalledWith(twilioMessage)
    })

    it('should unregister listener on unmount', () => {
        const onMessage = jest.fn()

        const { unmount } = renderHook(() =>
            useCallMessageListener(call as Call, onMessage),
        )

        unmount()

        const twilioMessage = {
            type: 'event-happened',
            data: { id: '123' },
        }

        call.emit('messageReceived', { content: twilioMessage })

        expect(onMessage).not.toHaveBeenCalled()
    })

    it('should re-register listener when call object changes', () => {
        const newCall: EventEmitter = new EventEmitter()
        const onMessage = jest.fn()

        const { rerender } = renderHook(
            ({ call }) => useCallMessageListener(call, onMessage),
            { initialProps: { call: call as Call } },
        )

        const twilioMessage = {
            type: 'event-happened',
            data: { id: '123' },
        }

        call.emit('messageReceived', { content: twilioMessage })
        expect(onMessage).toHaveBeenCalledWith(twilioMessage)
        expect(onMessage).toHaveBeenCalledTimes(1)

        rerender({ call: newCall as Call })

        call.emit('messageReceived', { content: twilioMessage })
        expect(onMessage).toHaveBeenCalledTimes(1)

        newCall.emit('messageReceived', { content: twilioMessage })
        expect(onMessage).toHaveBeenLastCalledWith(twilioMessage)
        expect(onMessage).toHaveBeenCalledTimes(2)
    })
})
