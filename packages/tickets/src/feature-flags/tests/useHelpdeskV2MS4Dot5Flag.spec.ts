import { useHelpdeskV2BaselineFlag } from '@repo/feature-flags'
import { useIsMobileResolution } from '@gorgias/toolkit-react'

import { renderHook } from '../../tests/render.utils'
import { useHelpdeskV2MS4Dot5Flag } from '../useHelpdeskV2MS4Dot5Flag'

vi.mock('@repo/feature-flags', () => ({
    useHelpdeskV2BaselineFlag: vi.fn(),
}))

vi.mock('@gorgias/toolkit-react', () => ({
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
            isMobile: false,
            expected: true,
        },
        {
            description: 'UIVisionBetaBaseline is disabled',
            hasUIVisionBeta: false,
            isMobile: false,
            expected: false,
        },
        {
            description: 'on mobile resolution',
            hasUIVisionBeta: true,
            isMobile: true,
            expected: false,
        },
        {
            description: 'all conditions are not met',
            hasUIVisionBeta: false,
            isMobile: true,
            expected: false,
        },
    ])(
        'returns $expected when $description',
        ({ hasUIVisionBeta, isMobile, expected }) => {
            vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
                hasUIVisionBetaBaselineFlag: hasUIVisionBeta,
                hasUIVisionBeta,
                onToggle: vi.fn(),
            })
            vi.mocked(useIsMobileResolution).mockReturnValue(isMobile)

            const { result } = renderHook(() => useHelpdeskV2MS4Dot5Flag())

            expect(result.current).toBe(expected)
        },
    )
})
