import { renderHook } from '@repo/testing/vitest'
import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useWindowSize } from '../../useWindowSize'
import { UPDATE_DEBOUNCE_TIME } from '../constants'
import { useIsMobileResolution } from '../useIsMobileResolution'

vi.mock('../../useWindowSize', () => ({
    useWindowSize: vi.fn(),
}))

describe('useIsMobileResolution', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.clearAllMocks()
    })

    it('should return false if window width is greater than the mobile breakpoint', () => {
        vi.mocked(useWindowSize).mockReturnValue({ width: 1024, height: 768 })
        const { result } = renderHook(() => useIsMobileResolution())

        expect(result.current).toBe(false)

        act(() => {
            vi.advanceTimersByTime(UPDATE_DEBOUNCE_TIME)
        })

        expect(result.current).toBe(false)
    })

    it('should return true if window width is lesser than the mobile breakpoint', () => {
        vi.mocked(useWindowSize).mockReturnValue({ width: 100, height: 768 })
        const { result } = renderHook(() => useIsMobileResolution())

        expect(result.current).toBe(true)

        act(() => {
            vi.advanceTimersByTime(UPDATE_DEBOUNCE_TIME)
        })

        expect(result.current).toBe(true)
    })
})
