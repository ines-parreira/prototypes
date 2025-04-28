import { act } from '@testing-library/react-hooks'

import { logEvent, SegmentEvent } from 'common/segment'
import { GorgiasInitialState } from 'types'
import { renderHook } from 'utils/testing/renderHook'

import { useSort } from '../useSort'

jest.mock('common/segment')

describe('useSort', () => {
    beforeEach(() => {
        window.GORGIAS_STATE = {
            currentAccount: {
                id: 123,
            },
        } as GorgiasInitialState
    })

    it('should log event when sort option changes', () => {
        const { result } = renderHook(() => useSort([]))

        act(() => {
            result.current.setSortOption({
                key: 'created_datetime',
                order: 'desc',
                label: 'Created',
            })
        })

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.CustomerTimelineSort,
            {
                account_id: 123,
                option: 'created_datetime_desc',
            },
        )
    })
})
