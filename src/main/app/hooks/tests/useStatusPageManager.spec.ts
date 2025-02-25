import { renderHook } from '@testing-library/react-hooks'

import statusPageManager from 'services/statusPageManager/statusPageManager'

import { useStatusPageManager } from '../useStatusPageManager'

jest.mock('services/statusPageManager/statusPageManager', () => ({
    startPolling: jest.fn(),
    stopPolling: jest.fn(),
}))

describe('useStatusPageManager', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should start polling on mount', () => {
        renderHook(() => useStatusPageManager())

        expect(statusPageManager.startPolling).toHaveBeenCalledWith()
    })

    it('should stop polling on unmount', () => {
        const { unmount } = renderHook(() => useStatusPageManager())

        unmount()
        expect(statusPageManager.stopPolling).toHaveBeenCalledWith()
    })
})
