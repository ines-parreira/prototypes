import moment from 'moment'

import { renderHook } from 'utils/testing/renderHook'

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
