import { renderHook } from '@testing-library/react'

import { dispatchDocumentEvent, useListenToDocumentEvent } from './utils'

describe('utils', () => {
    describe('dispatchDocumentEvent', () => {
        it('dispatches a custom event with the given name', () => {
            const eventName = 'TEST_EVENT'
            const listener = jest.fn()

            window.addEventListener(eventName, listener)
            dispatchDocumentEvent(eventName)

            expect(listener).toHaveBeenCalledTimes(1)
            window.removeEventListener(eventName, listener)
        })

        it('dispatches a custom event with detail', () => {
            const eventName = 'TEST_EVENT_WITH_DETAIL'
            const detail = { foo: 'bar', count: 42 }
            const listener = jest.fn()

            window.addEventListener(eventName, listener)
            dispatchDocumentEvent(eventName, detail)

            expect(listener).toHaveBeenCalledTimes(1)
            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: eventName,
                    detail,
                }),
            )
            window.removeEventListener(eventName, listener)
        })

        it('dispatches multiple events independently', () => {
            const event1Name = 'EVENT_1'
            const event2Name = 'EVENT_2'
            const listener1 = jest.fn()
            const listener2 = jest.fn()

            window.addEventListener(event1Name, listener1)
            window.addEventListener(event2Name, listener2)

            dispatchDocumentEvent(event1Name)

            expect(listener1).toHaveBeenCalledTimes(1)
            expect(listener2).not.toHaveBeenCalled()

            dispatchDocumentEvent(event2Name)

            expect(listener1).toHaveBeenCalledTimes(1)
            expect(listener2).toHaveBeenCalledTimes(1)

            window.removeEventListener(event1Name, listener1)
            window.removeEventListener(event2Name, listener2)
        })
    })

    describe('useListenToDocumentEvent', () => {
        it('adds event listener on mount', () => {
            const eventName = 'TEST_EVENT'
            const handler = jest.fn()

            renderHook(() => useListenToDocumentEvent(eventName, handler))

            dispatchDocumentEvent(eventName)

            expect(handler).toHaveBeenCalledTimes(1)
        })

        it('removes event listener on unmount', () => {
            const eventName = 'TEST_EVENT'
            const handler = jest.fn()

            const { unmount } = renderHook(() =>
                useListenToDocumentEvent(eventName, handler),
            )

            dispatchDocumentEvent(eventName)
            expect(handler).toHaveBeenCalledTimes(1)

            unmount()

            dispatchDocumentEvent(eventName)
            expect(handler).toHaveBeenCalledTimes(1)
        })

        it('updates handler when it changes', () => {
            const eventName = 'TEST_EVENT'
            const handler1 = jest.fn()
            const handler2 = jest.fn()

            const { rerender } = renderHook(
                ({ handler }) => useListenToDocumentEvent(eventName, handler),
                {
                    initialProps: { handler: handler1 },
                },
            )

            dispatchDocumentEvent(eventName)
            expect(handler1).toHaveBeenCalledTimes(1)
            expect(handler2).not.toHaveBeenCalled()

            rerender({ handler: handler2 })

            dispatchDocumentEvent(eventName)
            expect(handler1).toHaveBeenCalledTimes(1)
            expect(handler2).toHaveBeenCalledTimes(1)
        })

        it('updates event name when it changes', () => {
            const event1Name = 'EVENT_1'
            const event2Name = 'EVENT_2'
            const handler = jest.fn()

            const { rerender } = renderHook(
                ({ eventName }) => useListenToDocumentEvent(eventName, handler),
                {
                    initialProps: { eventName: event1Name },
                },
            )

            dispatchDocumentEvent(event1Name)
            expect(handler).toHaveBeenCalledTimes(1)

            rerender({ eventName: event2Name })

            dispatchDocumentEvent(event1Name)
            expect(handler).toHaveBeenCalledTimes(1)

            dispatchDocumentEvent(event2Name)
            expect(handler).toHaveBeenCalledTimes(2)
        })

        it('handles multiple listeners for the same event', () => {
            const eventName = 'TEST_EVENT'
            const handler1 = jest.fn()
            const handler2 = jest.fn()

            renderHook(() => useListenToDocumentEvent(eventName, handler1))
            renderHook(() => useListenToDocumentEvent(eventName, handler2))

            dispatchDocumentEvent(eventName)

            expect(handler1).toHaveBeenCalledTimes(1)
            expect(handler2).toHaveBeenCalledTimes(1)
        })

        it('passes event object to handler', () => {
            const eventName = 'TEST_EVENT'
            const detail = { test: 'value' }
            const handler = jest.fn()

            renderHook(() => useListenToDocumentEvent(eventName, handler))

            dispatchDocumentEvent(eventName, detail)

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: eventName,
                    detail,
                }),
            )
        })
    })
})
