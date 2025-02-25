import { renderHook } from '@testing-library/react-hooks'

import usePrevNextTicketId from '../usePrevNextTicketId'

describe('usePrevNextTicketId', () => {
    const mockPartials = [
        { id: 123, updated_datetime: Date.now() },
        { id: 456, updated_datetime: Date.now() },
        { id: 789, updated_datetime: Date.now() },
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
