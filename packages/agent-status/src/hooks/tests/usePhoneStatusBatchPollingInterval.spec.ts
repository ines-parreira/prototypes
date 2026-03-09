import type * as featureFlagsModule from '@repo/feature-flags'
import { FeatureFlagKey } from '@repo/feature-flags'

import { renderHook } from '../../tests/render.utils'
import { usePhoneStatusBatchPollingInterval } from '../usePhoneStatusBatchPollingInterval'

vi.mock('@repo/feature-flags', async () => {
    const actual = await vi.importActual<typeof featureFlagsModule>(
        '@repo/feature-flags',
    )
    return {
        ...actual,
        useFlag: vi.fn(),
    }
})

const featureFlags = await import('@repo/feature-flags')
const useFlagMock = vi.mocked(featureFlags.useFlag)

describe('usePhoneStatusBatchPollingInterval', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return default interval in milliseconds when feature flag returns default value', () => {
        useFlagMock.mockReturnValue(30)

        const { result } = renderHook(() =>
            usePhoneStatusBatchPollingInterval(),
        )

        expect(useFlagMock).toHaveBeenCalledWith(
            FeatureFlagKey.PhoneStatusBatchPollingInterval,
            30,
        )
        expect(result.current).toBe(30000)
    })

    it('should return custom interval in milliseconds when feature flag returns custom value', () => {
        useFlagMock.mockReturnValue(60)

        const { result } = renderHook(() =>
            usePhoneStatusBatchPollingInterval(),
        )

        expect(useFlagMock).toHaveBeenCalledWith(
            FeatureFlagKey.PhoneStatusBatchPollingInterval,
            30,
        )
        expect(result.current).toBe(60000)
    })
})
