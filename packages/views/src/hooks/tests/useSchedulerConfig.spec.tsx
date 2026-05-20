import { useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing/vitest'

import { DEFAULT_REFRESH_CONFIG } from '../../scheduler/refreshConfig'
import { useSchedulerConfig } from '../useSchedulerConfig'

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        ViewCountSchedulerV3Config: 'view-count-scheduler-v3-config',
    },
    useFlag: vi.fn(),
}))

const useFlagMock = vi.mocked(useFlag)

beforeEach(() => {
    vi.clearAllMocks()
})

describe('useSchedulerConfig', () => {
    it('returns the defaults when the flag is unset', () => {
        useFlagMock.mockReturnValue(null)

        const { result } = renderHook(() => useSchedulerConfig())

        expect(result.current).toEqual(DEFAULT_REFRESH_CONFIG)
    })

    it('returns the defaults when the flag payload fails validation', () => {
        useFlagMock.mockReturnValue({ tickIntervalSeconds: -1 })

        const { result } = renderHook(() => useSchedulerConfig())

        expect(result.current).toEqual(DEFAULT_REFRESH_CONFIG)
    })

    it('merges valid overrides onto the defaults', () => {
        useFlagMock.mockReturnValue({
            tickIntervalSeconds: 10,
            maxRecentViews: 12,
            activeViewTtlSeconds: 0,
        })

        const { result } = renderHook(() => useSchedulerConfig())

        expect(result.current).toEqual({
            ...DEFAULT_REFRESH_CONFIG,
            tickIntervalSeconds: 10,
            maxRecentViews: 12,
            activeViewTtlSeconds: 0,
        })
    })
})
