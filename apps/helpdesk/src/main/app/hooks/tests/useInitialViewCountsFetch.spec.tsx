import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'

import useAppDispatch from 'hooks/useAppDispatch'
import { fetchVisibleViewsCounts } from 'state/views/actions'

import useInitialViewCountsFetch from '../useInitialViewCountsFetch'

jest.mock('hooks/useAppDispatch')
jest.mock('state/views/actions', () => ({
    fetchVisibleViewsCounts: jest.fn(() => ({
        type: 'fetchVisibleViewsCounts',
    })),
}))

const useAppDispatchMock = useAppDispatch as jest.Mock
const useFlagWithLoadingMock = useFlagWithLoading as jest.Mock
const fetchVisibleViewsCountsMock = fetchVisibleViewsCounts as jest.Mock

describe('useInitialViewCountsFetch', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        jest.resetAllMocks()
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
        useFlagWithLoadingMock.mockReturnValue({
            value: false,
            isLoading: false,
        })
    })

    it('should use the Helpdesk v2 beta flag to gate the new scheduler', () => {
        renderHook(() => useInitialViewCountsFetch())

        expect(useFlagWithLoadingMock).toHaveBeenCalledWith(
            FeatureFlagKey.UIVisionBetaBaseline,
        )
    })

    it('should fetch visible view counts when the new scheduler is disabled', () => {
        renderHook(() => useInitialViewCountsFetch())

        expect(fetchVisibleViewsCountsMock).toHaveBeenCalled()
        expect(dispatch).toHaveBeenCalled()
    })

    it('should not fetch visible view counts while the flag is loading', () => {
        useFlagWithLoadingMock.mockReturnValue({
            value: false,
            isLoading: true,
        })

        renderHook(() => useInitialViewCountsFetch())

        expect(fetchVisibleViewsCountsMock).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
    })

    it('should not fetch visible view counts when the new scheduler is enabled', () => {
        useFlagWithLoadingMock.mockReturnValue({
            value: true,
            isLoading: false,
        })

        renderHook(() => useInitialViewCountsFetch())

        expect(fetchVisibleViewsCountsMock).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
    })
})
