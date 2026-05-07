import { renderHook } from '@repo/testing'
import { useHasNewViewCountScheduler } from '@repo/views'

import useAppDispatch from 'hooks/useAppDispatch'
import { fetchVisibleViewsCounts } from 'state/views/actions'

import useInitialViewCountsFetch from '../useInitialViewCountsFetch'

jest.mock('hooks/useAppDispatch')
jest.mock('@repo/views', () => ({
    useHasNewViewCountScheduler: jest.fn(),
}))
jest.mock('state/views/actions', () => ({
    fetchVisibleViewsCounts: jest.fn(() => ({
        type: 'fetchVisibleViewsCounts',
    })),
}))

const useAppDispatchMock = useAppDispatch as jest.Mock
const useHasNewViewCountSchedulerMock = useHasNewViewCountScheduler as jest.Mock
const fetchVisibleViewsCountsMock = fetchVisibleViewsCounts as jest.Mock

function mockHasNewScheduler({
    value = false,
    isLoading = false,
}: {
    value?: boolean
    isLoading?: boolean
} = {}) {
    useHasNewViewCountSchedulerMock.mockReturnValue({ value, isLoading })
}

describe('useInitialViewCountsFetch', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        jest.resetAllMocks()
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
        mockHasNewScheduler()
    })

    it('should fetch visible view counts when the new scheduler is disabled', () => {
        renderHook(() => useInitialViewCountsFetch())

        expect(fetchVisibleViewsCountsMock).toHaveBeenCalled()
        expect(dispatch).toHaveBeenCalled()
    })

    it('should not fetch visible view counts while the flag is loading', () => {
        mockHasNewScheduler({ isLoading: true })

        renderHook(() => useInitialViewCountsFetch())

        expect(fetchVisibleViewsCountsMock).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
    })

    it('should not fetch visible view counts when the new scheduler is enabled', () => {
        mockHasNewScheduler({ value: true })

        renderHook(() => useInitialViewCountsFetch())

        expect(fetchVisibleViewsCountsMock).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
    })
})
