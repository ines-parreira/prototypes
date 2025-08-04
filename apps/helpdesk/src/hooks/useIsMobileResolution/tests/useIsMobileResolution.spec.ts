import { useWindowSize } from '@repo/hooks'
import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import useIsMobileResolution from 'hooks/useIsMobileResolution/useIsMobileResolution'

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useWindowSize: jest.fn(),
}))
const mockUseWindowSize = useWindowSize as jest.Mock

describe('useIsMobileResolution', () => {
    beforeEach(() => {
        jest.useRealTimers()
        global.innerWidth = 1024
    })

    it('should return true if window width is greater than the mobile breakpoint', async () => {
        jest.useFakeTimers()
        mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 })
        const { result } = renderHook(() => useIsMobileResolution())
        await waitFor(() => {
            expect(result.current).toBe(false)
        })
    })

    it('should return true if window width is lesser than the mobile breakpoint', async () => {
        jest.useFakeTimers()
        mockUseWindowSize.mockReturnValue({ width: 100, height: 768 })
        const { result } = renderHook(() => useIsMobileResolution())

        await waitFor(() => {
            expect(result.current).toBe(true)
        })
    })
})
