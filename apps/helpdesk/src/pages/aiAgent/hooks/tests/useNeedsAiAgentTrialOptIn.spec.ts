import { useFlagWithLoading } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { useCurrentUserRole } from '@repo/users'

import { useNeedsAiAgentTrialOptIn } from 'pages/aiAgent/hooks/useNeedsAiAgentTrialOptIn'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlagWithLoading: jest.fn(),
}))
jest.mock('@repo/users', () => ({
    ...jest.requireActual('@repo/users'),
    useCurrentUserRole: jest.fn(),
}))
jest.mock('pages/aiAgent/trial/hooks/useTrialAccess', () => ({
    useTrialAccess: jest.fn(),
}))
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))

const mockUseFlagWithLoading = useFlagWithLoading as jest.Mock
const mockUseCurrentUserRole = useCurrentUserRole as jest.Mock
const mockUseTrialAccess = useTrialAccess as jest.Mock
const mockUseStoreConfigContext =
    useAiAgentStoreConfigurationContext as jest.Mock

const SHOP_NAME = 'my-shop'

const baseTrialAccess = {
    canSeeTrialCTA: false,
    canSeeSubscribeNowCTA: false,
    isInAiAgentTrial: false,
}

const inactiveStoreConfig = {
    chatChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
    emailChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
}

const liveStoreConfig = {
    chatChannelDeactivatedDatetime: null,
    emailChannelDeactivatedDatetime: null,
}

describe('useNeedsAiAgentTrialOptIn', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })
        mockUseCurrentUserRole.mockReturnValue({ isAdmin: true })
        mockUseTrialAccess.mockReturnValue(baseTrialAccess)
        mockUseStoreConfigContext.mockReturnValue({
            storeConfiguration: inactiveStoreConfig,
            isLoading: false,
        })
    })

    it('does not need opt-in when V3 flag is off', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            canSeeTrialCTA: true,
        })

        const { result } = renderHook(() =>
            useNeedsAiAgentTrialOptIn(SHOP_NAME),
        )

        expect(result.current.needsOptIn).toBe(false)
    })

    it('does not need opt-in for non-admins', () => {
        mockUseCurrentUserRole.mockReturnValue({ isAdmin: false })
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            canSeeTrialCTA: true,
        })

        const { result } = renderHook(() =>
            useNeedsAiAgentTrialOptIn(SHOP_NAME),
        )

        expect(result.current.needsOptIn).toBe(false)
    })

    it('does not need opt-in when already in AI Agent trial', () => {
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            canSeeTrialCTA: true,
            isInAiAgentTrial: true,
        })

        const { result } = renderHook(() =>
            useNeedsAiAgentTrialOptIn(SHOP_NAME),
        )

        expect(result.current.needsOptIn).toBe(false)
    })

    it('does not need opt-in without any trial CTA access', () => {
        mockUseTrialAccess.mockReturnValue(baseTrialAccess)

        const { result } = renderHook(() =>
            useNeedsAiAgentTrialOptIn(SHOP_NAME),
        )

        expect(result.current.needsOptIn).toBe(false)
    })

    it('does not need opt-in when AI Agent is already live on a channel', () => {
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            canSeeTrialCTA: true,
        })
        mockUseStoreConfigContext.mockReturnValue({
            storeConfiguration: liveStoreConfig,
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useNeedsAiAgentTrialOptIn(SHOP_NAME),
        )

        expect(result.current.needsOptIn).toBe(false)
    })

    it('does not need opt-in while store configuration is loading', () => {
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            canSeeTrialCTA: true,
        })
        mockUseStoreConfigContext.mockReturnValue({
            storeConfiguration: undefined,
            isLoading: true,
        })

        const { result } = renderHook(() =>
            useNeedsAiAgentTrialOptIn(SHOP_NAME),
        )

        expect(result.current.needsOptIn).toBe(false)
    })

    it('needs opt-in when admin can see trial CTA', () => {
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            canSeeTrialCTA: true,
        })

        const { result } = renderHook(() =>
            useNeedsAiAgentTrialOptIn(SHOP_NAME),
        )

        expect(result.current.needsOptIn).toBe(true)
    })

    it('does not need opt-in for subscribe-now-only cohorts (no trial offer makes sense)', () => {
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            canSeeSubscribeNowCTA: true,
        })

        const { result } = renderHook(() =>
            useNeedsAiAgentTrialOptIn(SHOP_NAME),
        )

        expect(result.current.needsOptIn).toBe(false)
    })

    it('needs opt-in when store configuration is absent (fresh user pre-deploy)', () => {
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            canSeeTrialCTA: true,
        })
        mockUseStoreConfigContext.mockReturnValue({
            storeConfiguration: undefined,
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useNeedsAiAgentTrialOptIn(SHOP_NAME),
        )

        expect(result.current.needsOptIn).toBe(true)
    })
})
