import { renderHook } from 'utils/testing/renderHook'

import { TicketCompact } from '../../types'
import useTicketIds from '../useTicketIds'

describe('useTicketIds', () => {
    it('should return ticket IDs', () => {
        const { result } = renderHook(() =>
            useTicketIds([
                {
                    id: 123,
                } as TicketCompact,
            ]),
        )

        expect(result.current).toEqual({ current: [123] })
    })
})
