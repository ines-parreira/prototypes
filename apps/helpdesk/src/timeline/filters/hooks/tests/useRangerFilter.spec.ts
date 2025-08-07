import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { logEvent, SegmentEvent } from '../../../../common/segment'
import { GorgiasInitialState } from '../../../../types'
import { useRangeFilter } from '../useRangeFilter'

jest.mock('../../../../common/segment')

describe('useRangeFilter', () => {
    beforeEach(() => {
        window.GORGIAS_STATE = {
            currentAccount: {
                id: 123,
            },
        } as GorgiasInitialState
    })

    it('should log event when range filter changes', () => {
        const { result } = renderHook(() => useRangeFilter([]))

        act(() => {
            result.current.setRangeFilter({
                start: 1234567890,
                end: 1234567899,
            })
        })

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.CustomerTimelineFilter,
            {
                account_id: 123,
                action: 'date-range-changed',
            },
        )
    })
})
