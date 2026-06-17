import { isSessionImpersonated } from '@repo/activity-tracker/utils'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'

import { useSkillReportingEnabled } from './useSkillReportingEnabled'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
jest.mock('@repo/activity-tracker/utils', () => ({
    isSessionImpersonated: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock
const mockIsSessionImpersonated = isSessionImpersonated as jest.Mock

describe('useSkillReportingEnabled', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockReturnValue(false)
        mockIsSessionImpersonated.mockReturnValue(false)
    })

    it('returns false when the flag is off and not impersonated', () => {
        const { result } = renderHook(() => useSkillReportingEnabled())

        expect(result.current).toBe(false)
    })

    it('returns true when the flag is on', () => {
        mockUseFlag.mockReturnValue(true)

        const { result } = renderHook(() => useSkillReportingEnabled())

        expect(result.current).toBe(true)
    })

    it('returns true when impersonated regardless of the flag', () => {
        mockIsSessionImpersonated.mockReturnValue(true)

        const { result } = renderHook(() => useSkillReportingEnabled())

        expect(result.current).toBe(true)
    })

    it('evaluates the correct feature flag key', () => {
        renderHook(() => useSkillReportingEnabled())

        expect(mockUseFlag).toHaveBeenCalledWith(
            FeatureFlagKey.IntentBasedKnowledgeMilestone3NewReportingLayer,
        )
    })
})
