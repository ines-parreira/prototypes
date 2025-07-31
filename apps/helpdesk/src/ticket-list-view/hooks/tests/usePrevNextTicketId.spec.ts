import { renderHook } from '@repo/testing'

import usePrevNextTicketId from '../usePrevNextTicketId'

describe('usePrevNextTicketId', () => {
    const mockPartials = [
        { id: 123, cursor: '123', updated_datetime: Date.now() },
        { id: 456, cursor: '456', updated_datetime: Date.now() },
        { id: 789, cursor: '789', updated_datetime: Date.now() },
    ]

    it('should return undefined if activeTicketId is undefined', () => {
        const { result } = renderHook(() =>
            usePrevNextTicketId(undefined, 'prev', []),
        )

        expect(result.current).toBeUndefined()
    })

    it('should return the previous ticket id', () => {
        const { result } = renderHook(() =>
            usePrevNextTicketId(456, 'prev', mockPartials),
        )

        expect(result.current).toBe(123)
    })

    it('should return the next ticket id', () => {
        const { result } = renderHook(() =>
            usePrevNextTicketId(456, 'next', mockPartials),
        )

        expect(result.current).toBe(789)
    })
})
