import { act, renderHook } from '@testing-library/react-hooks'

import useStaleTickets from '../useStaleTickets'

describe('useStaleTickets', () => {
    const initialPartials = [
        { id: 1, updated_datetime: 1000 },
        { id: 2, updated_datetime: 1000 },
        { id: 3, updated_datetime: 1000 },
    ]

    it('should return an empty array', () => {
        const { result } = renderHook(() => useStaleTickets([]))

        expect(result.current).toEqual({
            markUpdated: expect.any(Function),
            staleTickets: {},
        })
    })

    it('should mark initial tickets as stale', () => {
        const { result } = renderHook(() => useStaleTickets(initialPartials))

        expect(result.current.staleTickets).toEqual({
            1: true,
            2: true,
            3: true,
        })
    })

    it('should mark tickets as updated', () => {
        const { result } = renderHook(() => useStaleTickets(initialPartials))

        act(() => {
            result.current.markUpdated([2])
        })

        expect(result.current.staleTickets).toEqual({
            1: true,
            3: true,
        })
    })

    it('should not mark non-updated tickets as stale', () => {
        const { rerender, result } = renderHook(
            (partials) => useStaleTickets(partials),
            { initialProps: initialPartials },
        )

        act(() => {
            result.current.markUpdated([2])
        })

        rerender([
            { id: 1, updated_datetime: 1000 },
            { id: 2, updated_datetime: 1000 },
            { id: 3, updated_datetime: 1000 },
        ])

        expect(result.current.staleTickets).toEqual({
            1: true,
            3: true,
        })
    })

    it('should mark newly updated tickets as stale', () => {
        const { rerender, result } = renderHook(
            (partials) => useStaleTickets(partials),
            { initialProps: initialPartials },
        )

        act(() => {
            result.current.markUpdated([2])
        })

        rerender([
            { id: 1, updated_datetime: 1000 },
            { id: 2, updated_datetime: 2000 },
            { id: 3, updated_datetime: 1000 },
            { id: 4, updated_datetime: 1500 },
        ])

        expect(result.current.staleTickets).toEqual({
            1: true,
            2: true,
            3: true,
            4: true,
        })
    })
})
