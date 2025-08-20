import { renderHook } from '@repo/testing'

import { useFlag } from 'core/flags'

import { useIsConvertPerformanceViewEnabled } from '../useIsConvertPerformanceViewEnabled'

jest.mock('core/flags')
const mockUseFlag = useFlag as jest.Mock

describe('useIsConvertPerformanceViewEnabled', () => {
    it('feature flag is enabled', () => {
        mockUseFlag.mockReturnValue(true)
        const { result } = renderHook(() =>
            useIsConvertPerformanceViewEnabled(),
        )
        expect(result.current).toBe(true)
    })

    it('feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)
        const { result } = renderHook(() =>
            useIsConvertPerformanceViewEnabled(),
        )
        expect(result.current).toBe(false)
    })
})
