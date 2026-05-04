import { renderHook } from '@repo/testing'

import { useSkillsAccess } from './useSkillsAccess'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        KnowledgeIntentManagementSystem:
            'linear.project_knowledge-intent-management-system.enable-feature',
    },
    useFlag: jest.fn(),
}))

jest.mock('@repo/activity-tracker/utils', () => ({
    isSessionImpersonated: jest.fn(),
}))

const mockUseFlag = require('@repo/feature-flags').useFlag as jest.Mock
const mockIsSessionImpersonated = require('@repo/activity-tracker/utils')
    .isSessionImpersonated as jest.Mock

const mockFlagValue = (value: unknown) => {
    mockUseFlag.mockReturnValue(value)
}

beforeEach(() => {
    jest.clearAllMocks()
    mockIsSessionImpersonated.mockReturnValue(false)
})

describe('useSkillsAccess', () => {
    it('returns true when the flag is true', () => {
        mockFlagValue(true)

        const { result } = renderHook(() => useSkillsAccess())

        expect(result.current).toBe(true)
    })

    it('returns false when the flag is false', () => {
        mockFlagValue(false)

        const { result } = renderHook(() => useSkillsAccess())

        expect(result.current).toBe(false)
    })

    it('returns true when the flag is { impersonation: true } and the session is impersonated', () => {
        mockFlagValue({ impersonation: true })
        mockIsSessionImpersonated.mockReturnValue(true)

        const { result } = renderHook(() => useSkillsAccess())

        expect(result.current).toBe(true)
    })

    it('returns false when the flag is { impersonation: true } but the session is not impersonated', () => {
        mockFlagValue({ impersonation: true })
        mockIsSessionImpersonated.mockReturnValue(false)

        const { result } = renderHook(() => useSkillsAccess())

        expect(result.current).toBe(false)
    })

    it('returns true when the flag is true even if the session is impersonated', () => {
        mockFlagValue(true)
        mockIsSessionImpersonated.mockReturnValue(true)

        const { result } = renderHook(() => useSkillsAccess())

        expect(result.current).toBe(true)
    })
})
