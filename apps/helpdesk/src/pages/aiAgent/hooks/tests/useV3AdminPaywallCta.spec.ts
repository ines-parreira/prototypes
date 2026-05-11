import { useFlagWithLoading } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { useCurrentUserRole } from '@repo/users'

import useAppSelector from 'hooks/useAppSelector'
import { useV3AdminPaywallCta } from 'pages/aiAgent/hooks/useV3AdminPaywallCta'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

jest.mock('hooks/useAppSelector')
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

const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseFlagWithLoading = useFlagWithLoading as jest.Mock
const mockUseCurrentUserRole = useCurrentUserRole as jest.Mock
const mockUseTrialAccess = useTrialAccess as jest.Mock

const SHOP_NAME = 'my-shop'

const baseTrialAccess = {
    isOnboarded: false,
    canSeeTrialCTA: false,
    canSeeSubscribeNowCTA: false,
    isInAiAgentTrial: false,
    hasCurrentStoreTrialExpired: false,
    isTrialingSubscription: false,
    currentAutomatePlan: { generation: 5 },
}

describe('useV3AdminPaywallCta', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getShopifyIntegrationsSortedByName) {
                return [{ meta: { shop_name: SHOP_NAME } }]
            }
            return []
        })
        mockUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })
        mockUseCurrentUserRole.mockReturnValue({ isAdmin: true })
        mockUseTrialAccess.mockReturnValue(baseTrialAccess)
    })

    it('is not eligible when V3 flag is off', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            canSeeTrialCTA: true,
        })

        const { result } = renderHook(() => useV3AdminPaywallCta())

        expect(result.current.isEligible).toBe(false)
        expect(result.current.isV3FlagOn).toBe(false)
    })

    it('is not eligible for non-admins', () => {
        mockUseCurrentUserRole.mockReturnValue({ isAdmin: false })
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            canSeeTrialCTA: true,
        })

        const { result } = renderHook(() => useV3AdminPaywallCta())

        expect(result.current.isEligible).toBe(false)
    })

    it('is not eligible for already-onboarded users', () => {
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            canSeeTrialCTA: true,
            isOnboarded: true,
        })

        const { result } = renderHook(() => useV3AdminPaywallCta())

        expect(result.current.isEligible).toBe(false)
    })

    it('is eligible when admin can see trial CTA', () => {
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            canSeeTrialCTA: true,
        })

        const { result } = renderHook(() => useV3AdminPaywallCta())

        expect(result.current.isEligible).toBe(true)
        expect(result.current.isV3FlagOn).toBe(true)
    })

    it('is eligible when admin can see subscribe-now CTA', () => {
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            canSeeSubscribeNowCTA: true,
        })

        const { result } = renderHook(() => useV3AdminPaywallCta())

        expect(result.current.isEligible).toBe(true)
    })

    it('is eligible when admin can start onboarding (gen 6 plan)', () => {
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            currentAutomatePlan: { generation: 6 },
        })

        const { result } = renderHook(() => useV3AdminPaywallCta())

        expect(result.current.isEligible).toBe(true)
    })

    it('is eligible when admin is in active AI Agent trial but has not finished onboarding', () => {
        mockUseTrialAccess.mockReturnValue({
            ...baseTrialAccess,
            isInAiAgentTrial: true,
        })

        const { result } = renderHook(() => useV3AdminPaywallCta())

        expect(result.current.isEligible).toBe(true)
    })

    it('returns the first store shop name', () => {
        const { result } = renderHook(() => useV3AdminPaywallCta())

        expect(result.current.shopName).toBe(SHOP_NAME)
    })
})
