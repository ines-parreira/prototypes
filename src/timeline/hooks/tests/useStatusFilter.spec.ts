import { act } from '@testing-library/react-hooks'

import { logEvent, SegmentEvent } from 'common/segment'
import { GorgiasInitialState } from 'types'
import { renderHook } from 'utils/testing/renderHook'

import { useStatusFilter } from '../useStatusFilter'

jest.mock('common/segment')

describe('useStatusFilter', () => {
    beforeEach(() => {
        window.GORGIAS_STATE = {
            currentAccount: {
                id: 123,
            },
        } as GorgiasInitialState
    })

    it('should log event when status is toggled', () => {
        const { result } = renderHook(() => useStatusFilter([]))

        act(() => {
            result.current.toggleSelectedStatus('open')
        })

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.CustomerTimelineFilter,
            {
                account_id: 123,
                action: 'status-removed',
                option: 'open',
            },
        )

        // Then remove it
        act(() => {
            result.current.toggleSelectedStatus('open')
        })

        expect(logEvent).toHaveBeenLastCalledWith(
            SegmentEvent.CustomerTimelineFilter,
            {
                account_id: 123,
                action: 'status-added',
                option: 'open',
            },
        )
    })
})
