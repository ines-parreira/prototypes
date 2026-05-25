import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { UserRole } from '@repo/permissions'
import { assumeMock, renderHook } from '@repo/testing'
import { useCurrentUserRole } from '@repo/users'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { useNavigationProducts } from 'routes/layout/useNavigationProducts'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlagWithLoading: jest.fn(),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

jest.mock('@repo/users', () => ({
    ...jest.requireActual('@repo/users'),
    useCurrentUserRole: jest.fn(),
}))

const mockUseFlagWithLoading = assumeMock(useFlagWithLoading)
const mockUseAiAgentAccess = assumeMock(useAiAgentAccess)
const mockUseCurrentUserRole = assumeMock(useCurrentUserRole)

const setupMocks = ({
    isAiJourneyEnabled = false,
    hasAccess = true,
    isAdmin = true,
    hasRole = true,
}: {
    isAiJourneyEnabled?: boolean
    hasAccess?: boolean
    isAdmin?: boolean
    hasRole?: boolean
} = {}) => {
    mockUseFlagWithLoading.mockImplementation((key: FeatureFlagKey) =>
        key === FeatureFlagKey.AiJourneyEnabled
            ? { value: isAiJourneyEnabled, isLoading: false }
            : { value: false, isLoading: false },
    )
    mockUseAiAgentAccess.mockReturnValue({
        hasAccess,
        isLoading: false,
    })
    mockUseCurrentUserRole.mockReturnValue({
        isAdmin,
        hasRole: jest.fn().mockReturnValue(hasRole),
        currentUser: { id: 1, role: { name: 'viewer' } },
    })
}

describe('useNavigationProducts', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setupMocks()
    })

    it('should set canAccessAiAgent to true when user has Agent role', () => {
        const hasRole = jest.fn().mockReturnValue(true)
        mockUseCurrentUserRole.mockReturnValue({
            isAdmin: false,
            hasRole,
            currentUser: { id: 1, role: { name: 'agent' } },
        })

        const { result } = renderHook(() => useNavigationProducts())

        expect(result.current.canAccessAiAgent).toBe(true)
        expect(hasRole).toHaveBeenCalledWith(UserRole.Agent)
    })

    it('should set canAccessAiAgent to false when user does not have Agent role', () => {
        setupMocks({ hasRole: false })

        const { result } = renderHook(() => useNavigationProducts())

        expect(result.current.canAccessAiAgent).toBe(false)
    })

    it('should set aiAgentRequiresUpgrade to true when user has no AI Agent access', () => {
        setupMocks({ hasAccess: false })

        const { result } = renderHook(() => useNavigationProducts())

        expect(result.current.aiAgentRequiresUpgrade).toBe(true)
    })

    it('should set aiAgentRequiresUpgrade to false when user has AI Agent access', () => {
        setupMocks({ hasAccess: true })

        const { result } = renderHook(() => useNavigationProducts())

        expect(result.current.aiAgentRequiresUpgrade).toBe(false)
    })

    it('should set isAiJourneyVisible to true when AiJourneyEnabled flag is on', () => {
        setupMocks({ isAiJourneyEnabled: true })

        const { result } = renderHook(() => useNavigationProducts())

        expect(result.current.isAiJourneyVisible).toBe(true)
    })

    it('should set isAiJourneyVisible to false when AiJourneyEnabled flag is off', () => {
        setupMocks({ isAiJourneyEnabled: false })

        const { result } = renderHook(() => useNavigationProducts())

        expect(result.current.isAiJourneyVisible).toBe(false)
    })

    it('should set isConvertVisible to true when user is admin', () => {
        setupMocks({ isAdmin: true })

        const { result } = renderHook(() => useNavigationProducts())

        expect(result.current.isConvertVisible).toBe(true)
    })

    it('should set isConvertVisible to false when user is not admin', () => {
        setupMocks({ isAdmin: false })

        const { result } = renderHook(() => useNavigationProducts())

        expect(result.current.isConvertVisible).toBe(false)
    })
})
