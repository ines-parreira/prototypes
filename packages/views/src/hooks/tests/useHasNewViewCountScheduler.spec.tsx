import { useFlagWithLoading } from '@repo/feature-flags'
import { renderHook } from '@repo/testing/vitest'

import { useHasNewViewCountScheduler } from '../useHasNewViewCountScheduler'

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        ViewCountSchedulerV3: 'view-count-scheduler-v3',
    },
    useFlagWithLoading: vi.fn(),
}))

const useFlagWithLoadingMock = vi.mocked(useFlagWithLoading)

beforeEach(() => {
    vi.clearAllMocks()
})

describe('useHasNewViewCountScheduler', () => {
    it('is true when the v3 flag is on', () => {
        useFlagWithLoadingMock.mockReturnValue({
            value: true,
            isLoading: false,
        })

        const { result } = renderHook(() => useHasNewViewCountScheduler())

        expect(result.current.value).toBe(true)
        expect(result.current.isLoading).toBe(false)
    })

    it('is false when the v3 flag is off (legacy path)', () => {
        useFlagWithLoadingMock.mockReturnValue({
            value: false,
            isLoading: false,
        })

        const { result } = renderHook(() => useHasNewViewCountScheduler())

        expect(result.current.value).toBe(false)
    })

    it('exposes the flag loading state', () => {
        useFlagWithLoadingMock.mockReturnValue({
            value: false,
            isLoading: true,
        })

        const { result } = renderHook(() => useHasNewViewCountScheduler())

        expect(result.current.isLoading).toBe(true)
    })
})
