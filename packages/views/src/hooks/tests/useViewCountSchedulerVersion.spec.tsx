import {
    useFlagWithLoading,
    useHelpdeskV2BaselineFlag,
} from '@repo/feature-flags'
import { renderHook } from '@repo/testing/vitest'

import {
    useViewCountSchedulerVersion,
    ViewCountSchedulerVersion,
} from '../useViewCountSchedulerVersion'

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        ViewCountSchedulerV3: 'view-count-scheduler-v3',
        UIVisionBetaBaseline: 'ui-vision-beta-baseline',
    },
    useFlagWithLoading: vi.fn(),
    useHelpdeskV2BaselineFlag: vi.fn(),
}))

const useFlagWithLoadingMock = vi.mocked(useFlagWithLoading)
const useHelpdeskV2BaselineFlagMock = vi.mocked(useHelpdeskV2BaselineFlag)

function mockFlags({
    hasV3,
    hasV2,
    loadingV3 = false,
    loadingV2 = false,
}: {
    hasV3: boolean
    hasV2: boolean
    loadingV3?: boolean
    loadingV2?: boolean
}) {
    useFlagWithLoadingMock.mockImplementation((flag: string) => {
        if (flag === 'view-count-scheduler-v3') {
            return { value: hasV3, isLoading: loadingV3 }
        }
        return { value: undefined, isLoading: loadingV2 }
    })
    useHelpdeskV2BaselineFlagMock.mockReturnValue({
        hasUIVisionBeta: hasV2,
    } as ReturnType<typeof useHelpdeskV2BaselineFlag>)
}

beforeEach(() => {
    vi.clearAllMocks()
})

describe('useViewCountSchedulerVersion', () => {
    it('returns V3 when the v3 flag is on, regardless of v2', () => {
        mockFlags({ hasV3: true, hasV2: false })

        const { result } = renderHook(() => useViewCountSchedulerVersion())

        expect(result.current.version).toBe(ViewCountSchedulerVersion.V3)
    })

    it('V3 wins over V2 when both are on', () => {
        mockFlags({ hasV3: true, hasV2: true })

        const { result } = renderHook(() => useViewCountSchedulerVersion())

        expect(result.current.version).toBe(ViewCountSchedulerVersion.V3)
    })

    it('returns V2 when only the UIVisionBeta baseline is on', () => {
        mockFlags({ hasV3: false, hasV2: true })

        const { result } = renderHook(() => useViewCountSchedulerVersion())

        expect(result.current.version).toBe(ViewCountSchedulerVersion.V2)
    })

    it('returns Legacy when neither flag is on', () => {
        mockFlags({ hasV3: false, hasV2: false })

        const { result } = renderHook(() => useViewCountSchedulerVersion())

        expect(result.current.version).toBe(ViewCountSchedulerVersion.Legacy)
    })

    it('reports isLoading when the v3 flag is still loading', () => {
        mockFlags({ hasV3: false, hasV2: false, loadingV3: true })

        const { result } = renderHook(() => useViewCountSchedulerVersion())

        expect(result.current.isLoading).toBe(true)
    })

    it('reports isLoading when the v2 baseline is still loading', () => {
        mockFlags({ hasV3: false, hasV2: false, loadingV2: true })

        const { result } = renderHook(() => useViewCountSchedulerVersion())

        expect(result.current.isLoading).toBe(true)
    })
})
