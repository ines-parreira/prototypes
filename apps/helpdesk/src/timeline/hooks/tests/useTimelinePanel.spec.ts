import { renderHook } from '@repo/testing'

import { useSearchParam } from 'hooks/useSearchParam'
import { assumeMock } from 'utils/testing'

import { useTimelinePanel } from '../useTimelinePanel'

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useListTickets: jest.fn(),
}))
jest.mock('hooks/useSearchParam')

const useSearchParamMock = assumeMock(useSearchParam)

describe('useTimelinePanel', () => {
    const mockSetShopperId = jest.fn()

    beforeEach(() => {
        useSearchParamMock.mockReturnValue([null, mockSetShopperId])
    })

    it('should return timeline not displayed when no shopper ID in params', () => {
        const { result } = renderHook(() => useTimelinePanel())

        expect(result.current.isOpen).toBe(false)
        expect(result.current.shopperId).toBeNull()
    })

    it('should return timeline displayed when shopper ID exists in params', () => {
        useSearchParamMock.mockReturnValue(['123', mockSetShopperId])

        const { result } = renderHook(() => useTimelinePanel())

        expect(result.current.isOpen).toBe(true)
        expect(result.current.shopperId).toBe(123)
    })

    describe('opening / closing Timeline', () => {
        it('should set shopper ID when opening timeline', () => {
            useSearchParamMock.mockReturnValue(['ok', mockSetShopperId])
            const { result } = renderHook(() => useTimelinePanel())

            result.current.openTimeline(123)
            expect(mockSetShopperId).toHaveBeenCalledWith('123')
        })

        it('should clear shopper ID when closing timeline', () => {
            const { result } = renderHook(() => useTimelinePanel())

            result.current.closeTimeline()

            expect(mockSetShopperId).toHaveBeenCalledWith(null)
        })
    })
})
