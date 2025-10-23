import { act, renderHook } from '@testing-library/react'

import { PlaygroundEvent } from '../../types'
import {
    EventsProvider,
    useEvents,
    useSubscribeToEvent,
} from '../EventsContext'

describe('EventsContext', () => {
    describe('useEvents', () => {
        it('should throw error when used outside provider', () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            expect(() => {
                renderHook(() => useEvents())
            }).toThrow(
                'usePlaygroundEvents must be used within PlaygroundEventsProvider',
            )

            consoleErrorSpy.mockRestore()
        })

        it('should return events object when used inside provider', () => {
            const { result } = renderHook(() => useEvents(), {
                wrapper: ({ children }) => (
                    <EventsProvider>{children}</EventsProvider>
                ),
            })

            expect(result.current).toBeDefined()
            expect(result.current.on).toBeInstanceOf(Function)
            expect(result.current.emit).toBeInstanceOf(Function)
        })
    })

    describe('Event emitter functionality', () => {
        it('should register and trigger event listener', () => {
            const callback = jest.fn()

            const { result } = renderHook(() => useEvents(), {
                wrapper: ({ children }) => (
                    <EventsProvider>{children}</EventsProvider>
                ),
            })

            act(() => {
                result.current.on(PlaygroundEvent.RESET_CONVERSATION, callback)
            })

            act(() => {
                result.current.emit(PlaygroundEvent.RESET_CONVERSATION)
            })

            expect(callback).toHaveBeenCalledTimes(1)
        })

        it('should unregister event listener', () => {
            const callback = jest.fn()

            const { result } = renderHook(() => useEvents(), {
                wrapper: ({ children }) => (
                    <EventsProvider>{children}</EventsProvider>
                ),
            })

            let unsubscribe: () => void = () => {}

            act(() => {
                unsubscribe = result.current.on(
                    PlaygroundEvent.RESET_CONVERSATION,
                    callback,
                )
            })

            act(() => {
                unsubscribe()
            })

            act(() => {
                result.current.emit(PlaygroundEvent.RESET_CONVERSATION)
            })

            expect(callback).not.toHaveBeenCalled()
        })

        it('should handle multiple event listeners for the same event', () => {
            const callback1 = jest.fn()
            const callback2 = jest.fn()

            const { result } = renderHook(() => useEvents(), {
                wrapper: ({ children }) => (
                    <EventsProvider>{children}</EventsProvider>
                ),
            })

            act(() => {
                result.current.on(PlaygroundEvent.RESET_CONVERSATION, callback1)
                result.current.on(PlaygroundEvent.RESET_CONVERSATION, callback2)
            })

            act(() => {
                result.current.emit(PlaygroundEvent.RESET_CONVERSATION)
            })

            expect(callback1).toHaveBeenCalledTimes(1)
            expect(callback2).toHaveBeenCalledTimes(1)
        })

        it('should only trigger listeners for the emitted event', () => {
            const callback = jest.fn()

            const { result } = renderHook(() => useEvents(), {
                wrapper: ({ children }) => (
                    <EventsProvider>{children}</EventsProvider>
                ),
            })

            act(() => {
                result.current.on(PlaygroundEvent.RESET_CONVERSATION, callback)
            })

            act(() => {
                result.current.emit(PlaygroundEvent.RESET_CONVERSATION)
            })

            expect(callback).toHaveBeenCalledTimes(1)
        })

        it('should maintain separate listener lists for different events', () => {
            const callback1 = jest.fn()

            const { result } = renderHook(() => useEvents(), {
                wrapper: ({ children }) => (
                    <EventsProvider>{children}</EventsProvider>
                ),
            })

            act(() => {
                result.current.on(PlaygroundEvent.RESET_CONVERSATION, callback1)
            })

            act(() => {
                result.current.emit(PlaygroundEvent.RESET_CONVERSATION)
            })

            expect(callback1).toHaveBeenCalledTimes(1)
        })
    })

    describe('useSubscribeToEvent', () => {
        it('should register event listener on mount', () => {
            const callback = jest.fn()

            const { result } = renderHook(
                () => {
                    const events = useEvents()
                    useSubscribeToEvent(
                        PlaygroundEvent.RESET_CONVERSATION,
                        callback,
                    )
                    return events
                },
                {
                    wrapper: ({ children }) => (
                        <EventsProvider>{children}</EventsProvider>
                    ),
                },
            )

            act(() => {
                result.current.emit(PlaygroundEvent.RESET_CONVERSATION)
            })

            expect(callback).toHaveBeenCalledTimes(1)
        })

        it('should unregister event listener on unmount', () => {
            const callback = jest.fn()

            const { result, unmount } = renderHook(
                () => {
                    const events = useEvents()
                    useSubscribeToEvent(
                        PlaygroundEvent.RESET_CONVERSATION,
                        callback,
                    )
                    return events
                },
                {
                    wrapper: ({ children }) => (
                        <EventsProvider>{children}</EventsProvider>
                    ),
                },
            )

            const emitFn = result.current.emit

            unmount()

            act(() => {
                emitFn(PlaygroundEvent.RESET_CONVERSATION)
            })

            expect(callback).not.toHaveBeenCalled()
        })

        it('should handle callback changes', () => {
            const callback1 = jest.fn()
            const callback2 = jest.fn()

            const { result, rerender } = renderHook(
                ({ cb }: { cb: () => void }) => {
                    const events = useEvents()
                    useSubscribeToEvent(PlaygroundEvent.RESET_CONVERSATION, cb)
                    return events
                },
                {
                    wrapper: ({ children }) => (
                        <EventsProvider>{children}</EventsProvider>
                    ),
                    initialProps: { cb: callback1 },
                },
            )

            act(() => {
                result.current.emit(PlaygroundEvent.RESET_CONVERSATION)
            })

            expect(callback1).toHaveBeenCalledTimes(1)
            expect(callback2).not.toHaveBeenCalled()

            rerender({ cb: callback2 })

            act(() => {
                result.current.emit(PlaygroundEvent.RESET_CONVERSATION)
            })

            expect(callback1).toHaveBeenCalledTimes(1)
            expect(callback2).toHaveBeenCalledTimes(1)
        })
    })
})
