import {
    useFlagWithLoading,
    useHelpdeskV2BaselineFlag,
} from '@repo/feature-flags'
import { renderHook } from '@repo/testing/vitest'

import { useHasNewViewCountScheduler } from '../useHasNewViewCountScheduler'

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: { UIVisionBetaBaseline: 'ui-vision-beta-baseline' },
    useFlagWithLoading: vi.fn(),
    useHelpdeskV2BaselineFlag: vi.fn(),
}))

const useFlagWithLoadingMock = vi.mocked(useFlagWithLoading)
const useHelpdeskV2BaselineFlagMock = vi.mocked(useHelpdeskV2BaselineFlag)

function mockBaseline({
    hasUIVisionBeta = false,
    isLoading = false,
}: {
    hasUIVisionBeta?: boolean
    isLoading?: boolean
} = {}) {
    useHelpdeskV2BaselineFlagMock.mockReturnValue({
        hasUIVisionBetaBaselineFlag: hasUIVisionBeta,
        hasUIVisionBeta,
        onToggle: vi.fn(),
    })
    useFlagWithLoadingMock.mockReturnValue({
        value: hasUIVisionBeta,
        isLoading,
    })
}

beforeEach(() => {
    vi.clearAllMocks()
})

describe('useHasNewViewCountScheduler', () => {
    it('is enabled when the baseline flag and UI toggle are both on', () => {
        mockBaseline({ hasUIVisionBeta: true })

        const { result } = renderHook(() => useHasNewViewCountScheduler())

        expect(result.current.value).toBe(true)
        expect(result.current.isLoading).toBe(false)
    })

    it('is disabled when the baseline flag (or toggle) is off', () => {
        mockBaseline({ hasUIVisionBeta: false })

        const { result } = renderHook(() => useHasNewViewCountScheduler())

        expect(result.current.value).toBe(false)
    })

    it('exposes the baseline flag loading state', () => {
        mockBaseline({ hasUIVisionBeta: false, isLoading: true })

        const { result } = renderHook(() => useHasNewViewCountScheduler())

        expect(result.current.isLoading).toBe(true)
    })
})
