import { useFlagWithLoading } from '@repo/feature-flags'
import { renderHook } from '@repo/testing/vitest'

import {
    useViewCountSchedulerVersion,
    ViewCountSchedulerVersion,
} from '../useViewCountSchedulerVersion'

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        ViewCountSchedulerV3: 'view-count-scheduler-v3',
    },
    useFlagWithLoading: vi.fn(),
}))

const useFlagWithLoadingMock = vi.mocked(useFlagWithLoading)

function mockV3({
    hasV3,
    loadingV3 = false,
}: {
    hasV3: boolean
    loadingV3?: boolean
}) {
    useFlagWithLoadingMock.mockReturnValue({
        value: hasV3,
        isLoading: loadingV3,
    })
}

beforeEach(() => {
    vi.clearAllMocks()
})

describe('useViewCountSchedulerVersion', () => {
    it('returns V3 when the v3 flag is on', () => {
        mockV3({ hasV3: true })

        const { result } = renderHook(() => useViewCountSchedulerVersion())

        expect(result.current.version).toBe(ViewCountSchedulerVersion.V3)
    })

    it('returns Legacy when the v3 flag is off', () => {
        mockV3({ hasV3: false })

        const { result } = renderHook(() => useViewCountSchedulerVersion())

        expect(result.current.version).toBe(ViewCountSchedulerVersion.Legacy)
    })

    it('reports isLoading while the v3 flag is still loading', () => {
        mockV3({ hasV3: false, loadingV3: true })

        const { result } = renderHook(() => useViewCountSchedulerVersion())

        expect(result.current.isLoading).toBe(true)
    })
})
