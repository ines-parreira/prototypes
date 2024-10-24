import {renderHook} from '@testing-library/react-hooks'

import useIsMobileResolution from 'hooks/useIsMobileResolution/useIsMobileResolution'
import useWindowSize from 'hooks/useWindowSize'

jest.mock('hooks/useWindowSize')
const mockUseWindowSize = useWindowSize as jest.Mock

describe('useIsMobileResolution', () => {
    beforeEach(() => {
        jest.useRealTimers()
        global.innerWidth = 1024
    })

    it('should return true if window width is greater than the mobile breakpoint', async () => {
        jest.useFakeTimers()
        mockUseWindowSize.mockReturnValue({width: 1024, height: 768})
        const {result, waitFor} = renderHook(() => useIsMobileResolution())
        await waitFor(() => {
            expect(result.current).toBe(false)
        })
    })

    it('should return true if window width is lesser than the mobile breakpoint', async () => {
        jest.useFakeTimers()
        mockUseWindowSize.mockReturnValue({width: 100, height: 768})
        const {result, waitFor} = renderHook(() => useIsMobileResolution())

        await waitFor(() => {
            expect(result.current).toBe(true)
        })
    })
})
