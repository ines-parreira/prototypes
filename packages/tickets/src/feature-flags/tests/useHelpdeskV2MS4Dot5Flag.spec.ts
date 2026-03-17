import {
    FeatureFlagKey,
    useFlag,
    useHelpdeskV2BaselineFlag,
} from '@repo/feature-flags'
import { useIsMobileResolution } from '@repo/hooks'

import { renderHook } from '../../tests/render.utils'
import { useHelpdeskV2MS4Dot5Flag } from '../useHelpdeskV2MS4Dot5Flag'

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        UIVisionMilestone4Dot5: 'UIVisionMilestone4Dot5',
    },
    useFlag: vi.fn(),
    useHelpdeskV2BaselineFlag: vi.fn(),
}))

vi.mock('@repo/hooks', () => ({
    useIsMobileResolution: vi.fn(),
}))

describe('useHelpdeskV2MS4Dot5Flag', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it.each([
        {
            description: 'all conditions are met',
            hasUIVisionBeta: true,
            hasFlag: true,
            isMobile: false,
            expected: true,
        },
        {
            description: 'UIVisionBetaBaseline is disabled',
            hasUIVisionBeta: false,
            hasFlag: true,
            isMobile: false,
            expected: false,
        },
        {
            description: 'UIVisionMilestone4Dot5 is disabled',
            hasUIVisionBeta: true,
            hasFlag: false,
            isMobile: false,
            expected: false,
        },
        {
            description: 'on mobile resolution',
            hasUIVisionBeta: true,
            hasFlag: true,
            isMobile: true,
            expected: false,
        },
        {
            description: 'all conditions are not met',
            hasUIVisionBeta: false,
            hasFlag: false,
            isMobile: true,
            expected: false,
        },
    ])(
        'returns $expected when $description',
        ({ hasUIVisionBeta, hasFlag, isMobile, expected }) => {
            vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
                hasUIVisionBetaBaselineFlag: hasUIVisionBeta,
                hasUIVisionBeta,
                onToggle: vi.fn(),
            })
            vi.mocked(useFlag).mockImplementation((key: string) => {
                if (key === FeatureFlagKey.UIVisionMilestone4Dot5)
                    return hasFlag
                return false
            })
            vi.mocked(useIsMobileResolution).mockReturnValue(isMobile)

            const { result } = renderHook(() => useHelpdeskV2MS4Dot5Flag())

            expect(result.current).toBe(expected)
        },
    )
})
