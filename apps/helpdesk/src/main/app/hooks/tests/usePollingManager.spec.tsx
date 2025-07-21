import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import pollingManager from 'services/pollingManager'
import { EqualityOperator } from 'state/rules/types'
import { getViewFilters } from 'state/views/utils'
import { renderHook } from 'utils/testing/renderHook'

import usePollingManager from '../usePollingManager'

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('services/pollingManager', () => ({
    start: jest.fn(),
    stop: jest.fn(),
    stopRecentViewCountsInterval: jest.fn(),
}))

jest.mock('state/views/utils')

const getViewFiltersMock = getViewFilters as jest.Mock

const mockAppSelector = ({
    currentUser = {
        is_active: true,
    },
    activeView = {
        filters_ast: {},
    },
    shouldFetchActiveViewTickets = false,
}: {
    currentUser?: Record<string, any>
    activeView?: Record<string, any>
    shouldFetchActiveViewTickets?: boolean
} = {}) =>
    useAppSelectorMock
        .mockReturnValueOnce(fromJS(currentUser))
        .mockReturnValueOnce(fromJS(activeView))
        .mockReturnValueOnce(shouldFetchActiveViewTickets)

describe('usePollingManager', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should start polling when user becomes active', () => {
        mockAppSelector({ currentUser: { is_active: false } })
        const { rerender } = renderHook(() => usePollingManager())
        expect(pollingManager.start).not.toHaveBeenCalled()

        mockAppSelector({ currentUser: { is_active: true } })
        rerender()
        expect(pollingManager.start).toHaveBeenCalled()
    })

    it('should stop polling when user becomes inactive', () => {
        mockAppSelector({ currentUser: { is_active: true } })
        const { rerender } = renderHook(() => usePollingManager())

        mockAppSelector({ currentUser: { is_active: false } })
        rerender()
        expect(pollingManager.stop).toHaveBeenCalled()
    })

    it("should not stop fetching recent views' counts", () => {
        mockAppSelector({ currentUser: { is_active: true } })
        const { rerender } = renderHook(() => usePollingManager())

        mockAppSelector({
            currentUser: { is_active: false },
            shouldFetchActiveViewTickets: false,
        })
        rerender()

        expect(
            pollingManager.stopRecentViewCountsInterval,
        ).not.toHaveBeenCalled()
    })

    it("should stop fetching recent views' counts when user becomes inactive and active view has a chat filter", () => {
        mockAppSelector({ currentUser: { is_active: true } })
        const { rerender } = renderHook(() => usePollingManager())

        mockAppSelector({
            currentUser: { is_active: false },
            shouldFetchActiveViewTickets: true,
        })
        getViewFiltersMock.mockReturnValue([
            {
                operator: EqualityOperator.Eq,
                left: 'ticket.channel',
                right: 'chat',
            },
        ])
        rerender()

        expect(pollingManager.stopRecentViewCountsInterval).toHaveBeenCalled()
    })

    it('should stop polling on unmount', () => {
        mockAppSelector({ currentUser: { is_active: true } })
        const { unmount } = renderHook(() => usePollingManager())

        unmount()
        expect(pollingManager.stop).toHaveBeenCalled()
    })
})
