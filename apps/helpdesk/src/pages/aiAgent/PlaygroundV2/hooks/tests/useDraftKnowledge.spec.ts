import { act, renderHook } from '@testing-library/react'

import { useDraftKnowledgeSync } from '../useDraftKnowledge'

jest.useFakeTimers()

describe('useDraftKnowledgeSync', () => {
    afterEach(() => {
        jest.clearAllTimers()
    })

    describe('when draftKnowledge is not provided', () => {
        it('should immediately return isDraftKnowledgeReady as true', () => {
            const { result } = renderHook(() =>
                useDraftKnowledgeSync(undefined),
            )

            expect(result.current.isDraftKnowledgeReady).toBe(true)
        })

        it('should not set a timer', () => {
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout')
            renderHook(() => useDraftKnowledgeSync(undefined))

            expect(setTimeoutSpy).not.toHaveBeenCalled()

            setTimeoutSpy.mockRestore()
        })
    })

    describe('when draftKnowledge is provided', () => {
        const mockDraftKnowledge = {
            sourceId: 123,
            sourceSetId: 456,
        }

        it('should initially return isDraftKnowledgeReady as false', () => {
            const { result } = renderHook(() =>
                useDraftKnowledgeSync(mockDraftKnowledge),
            )

            expect(result.current.isDraftKnowledgeReady).toBe(false)
        })

        it('should set isDraftKnowledgeReady to true after 5 seconds', () => {
            const { result } = renderHook(() =>
                useDraftKnowledgeSync(mockDraftKnowledge),
            )

            expect(result.current.isDraftKnowledgeReady).toBe(false)

            act(() => {
                jest.advanceTimersByTime(5000)
            })

            expect(result.current.isDraftKnowledgeReady).toBe(true)
        })

        it('should not set isDraftKnowledgeReady to true before 5 seconds', () => {
            const { result } = renderHook(() =>
                useDraftKnowledgeSync(mockDraftKnowledge),
            )

            expect(result.current.isDraftKnowledgeReady).toBe(false)

            act(() => {
                jest.advanceTimersByTime(4999)
            })

            expect(result.current.isDraftKnowledgeReady).toBe(false)
        })
    })

    describe('when draftKnowledge changes', () => {
        it('should reset isDraftKnowledgeReady to false when draftKnowledge changes from undefined to defined', () => {
            const { result, rerender } = renderHook(
                ({ draftKnowledge }) => useDraftKnowledgeSync(draftKnowledge),
                {
                    initialProps: { draftKnowledge: undefined },
                },
            )

            expect(result.current.isDraftKnowledgeReady).toBe(true)

            rerender({
                draftKnowledge: {
                    sourceId: 123,
                    sourceSetId: 456,
                } as any,
            })

            expect(result.current.isDraftKnowledgeReady).toBe(false)
        })

        it('should set isDraftKnowledgeReady to true when draftKnowledge changes from defined to undefined', () => {
            const { result, rerender } = renderHook(
                ({ draftKnowledge }) => useDraftKnowledgeSync(draftKnowledge),
                {
                    initialProps: {
                        draftKnowledge: {
                            sourceId: 123,
                            sourceSetId: 456,
                        },
                    },
                },
            )

            expect(result.current.isDraftKnowledgeReady).toBe(false)

            rerender({ draftKnowledge: undefined } as any)

            expect(result.current.isDraftKnowledgeReady).toBe(true)
        })

        it('should restart the timer when draftKnowledge object changes', () => {
            const { result, rerender } = renderHook(
                ({ draftKnowledge }) => useDraftKnowledgeSync(draftKnowledge),
                {
                    initialProps: {
                        draftKnowledge: {
                            sourceId: 123,
                            sourceSetId: 456,
                        },
                    },
                },
            )

            expect(result.current.isDraftKnowledgeReady).toBe(false)

            act(() => {
                jest.advanceTimersByTime(3000)
            })

            expect(result.current.isDraftKnowledgeReady).toBe(false)

            rerender({
                draftKnowledge: {
                    sourceId: 789,
                    sourceSetId: 101,
                },
            })

            expect(result.current.isDraftKnowledgeReady).toBe(false)

            act(() => {
                jest.advanceTimersByTime(3000)
            })

            expect(result.current.isDraftKnowledgeReady).toBe(false)

            act(() => {
                jest.advanceTimersByTime(2000)
            })

            expect(result.current.isDraftKnowledgeReady).toBe(true)
        })
    })

    describe('cleanup', () => {
        it('should clear the timer when component unmounts', () => {
            const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

            const { unmount } = renderHook(() =>
                useDraftKnowledgeSync({
                    sourceId: 123,
                    sourceSetId: 456,
                }),
            )

            unmount()

            expect(clearTimeoutSpy).toHaveBeenCalled()

            clearTimeoutSpy.mockRestore()
        })

        it('should clear the previous timer when draftKnowledge changes', () => {
            const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

            const { rerender } = renderHook(
                ({ draftKnowledge }) => useDraftKnowledgeSync(draftKnowledge),
                {
                    initialProps: {
                        draftKnowledge: {
                            sourceId: 123,
                            sourceSetId: 456,
                        },
                    },
                },
            )

            const callCountBefore = clearTimeoutSpy.mock.calls.length

            rerender({
                draftKnowledge: {
                    sourceId: 789,
                    sourceSetId: 101,
                },
            })

            expect(clearTimeoutSpy.mock.calls.length).toBeGreaterThan(
                callCountBefore,
            )

            clearTimeoutSpy.mockRestore()
        })
    })
})
