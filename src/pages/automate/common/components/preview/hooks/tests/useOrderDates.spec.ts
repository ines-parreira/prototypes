import { renderHook } from '@testing-library/react-hooks'
import moment from 'moment'

import useOrderDates from '../useOrderDates'

describe('useOrderDates', () => {
    it('should return order dates', () => {
        const { result } = renderHook(() => useOrderDates('en'))
        expect(result.current).toEqual({
            etaDate: expect.any(moment),
            inTransitDate: expect.any(moment),
            infoReceivedDate: expect.any(moment),
            orderPlacedDate: expect.any(moment),
        })
    })
})
