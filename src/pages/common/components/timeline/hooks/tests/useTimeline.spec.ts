import { fromJS } from 'immutable'

import { useSearchParam } from 'hooks/useSearchParam'
import { getCustomerHistory, getLoading } from 'state/customers/selectors'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useTimeline } from '../useTimeline'

jest.mock('hooks/useAppSelector', () => jest.fn((selector) => selector()))
jest.mock('hooks/useSearchParam')
jest.mock('state/customers/selectors')

const useSearchParamMock = assumeMock(useSearchParam)
const getCustomerHistoryMock = assumeMock(getCustomerHistory)
const getLoadingMock = assumeMock(getLoading)

describe('useTimeline', () => {
    const mockSetTimelineShopperId = jest.fn()
    const mockCustomerHistory = {
        tickets: [{ id: 1 }, { id: 2 }],
    }
    const mockLoading = fromJS({ history: true })

    beforeEach(() => {
        getLoadingMock.mockReturnValue(mockLoading)
        useSearchParamMock.mockReturnValue([null, mockSetTimelineShopperId])
        getCustomerHistoryMock.mockReturnValue(fromJS(mockCustomerHistory))
    })

    it('should return timeline not displayed when no shopper ID', () => {
        const { result } = renderHook(() => useTimeline())

        expect(result.current.isOpen).toBe(false)
        expect(result.current.timelineShopperId).toBeNull()
    })

    it('should return timeline displayed when shopper ID exists', () => {
        useSearchParamMock.mockReturnValue(['123', mockSetTimelineShopperId])

        const { result } = renderHook(() => useTimeline())

        expect(result.current.isOpen).toBe(true)
        expect(result.current.timelineShopperId).toBe('123')
    })

    it('should return customer history tickets', () => {
        const { result } = renderHook(() => useTimeline())

        expect(result.current.tickets).toEqual(mockCustomerHistory.tickets)
    })

    it('should return loading state', () => {
        const { result } = renderHook(() => useTimeline())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return hasTriedLoading from customer history', () => {
        getCustomerHistoryMock.mockReturnValue(
            fromJS({
                ...mockCustomerHistory,
                triedLoading: true,
            }),
        )

        const { result } = renderHook(() => useTimeline())

        expect(result.current.hasTriedLoading).toBe(true)
    })

    describe('opening / closing Timeline', () => {
        it('should set shopper ID t when opening timeline', () => {
            useSearchParamMock.mockReturnValue(['ok', mockSetTimelineShopperId])
            const { result } = renderHook(() => useTimeline())

            result.current.openTimeline(123)

            expect(mockSetTimelineShopperId).toHaveBeenCalledWith('123')
        })

        it('should clear shopper ID when closing timeline', () => {
            const { result } = renderHook(() => useTimeline())

            result.current.closeTimeline()

            expect(mockSetTimelineShopperId).toHaveBeenCalledWith(null)
        })
    })
})
