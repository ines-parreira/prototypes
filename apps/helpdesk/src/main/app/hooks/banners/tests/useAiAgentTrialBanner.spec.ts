import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { AlertBannerTypes, BannerCategories, ContextBanner } from 'AlertBanners'
import useAppSelector from 'hooks/useAppSelector'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser, getRoleName } from 'state/currentUser/selectors'

import { useAiAgentTrialBanner } from '../useAiAgentTrialBanner'

// Mocks
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: jest.fn(() => ({
        routes: { overview: '/app/ai-agent/overview' },
    })),
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useLocation: jest.fn(() => ({ pathname: '/app' })),
}))

jest.mock('pages/aiAgent/trial/hooks/useTrialAccess', () => ({
    useTrialAccess: jest.fn(() => ({
        canSeeSystemBanner: true,
        trialType: TrialType.AiAgent,
    })),
}))

jest.mock('state/integrations/selectors', () => {
    const original = jest.requireActual('state/integrations/selectors')
    return {
        ...original,
        getIntegrationsByType: jest.fn(() => 'MOCK_SHOPIFY_SELECTOR'),
    }
})

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        TrialSystemWideBannerViewed: 'TrialSystemWideBannerViewed',
        TrialSystemWideBannerCTAClicked: 'TrialSystemWideBannerCTAClicked',
    },
}))

const mockedAddBanner = jest.fn<unknown, [ContextBanner]>()
const mockedRemoveBanner = jest.fn()

jest.mock(
    'AlertBanners',
    () =>
        ({
            ...jest.requireActual('AlertBanners'),
            useBanners: () => ({
                addBanner: mockedAddBanner,
                removeBanner: mockedRemoveBanner,
            }),
        }) as Record<string, unknown>,
)

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

describe('useAiAgentTrialBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        const { useTrialAccess } = jest.requireMock(
            'pages/aiAgent/trial/hooks/useTrialAccess',
        ) as { useTrialAccess: jest.Mock }
        useTrialAccess.mockReturnValue({
            canSeeSystemBanner: true,
            trialType: TrialType.AiAgent,
        })

        useAppSelectorMock.mockImplementation((selector: any) => {
            if (selector === 'MOCK_SHOPIFY_SELECTOR') {
                return [
                    {
                        id: 'shopify-1',
                        meta: { shop_name: 'store1' },
                    },
                ]
            }
            // No Automate subscription
            if (selector === getHasAutomate) {
                return false
            }
            // Current account and user for event payload
            if (selector === getCurrentAccountState) {
                return fromJS({ id: 'acc-1' })
            }
            if (selector === getCurrentUser) {
                return fromJS({ id: 'user-1' })
            }
            if (selector === getRoleName) {
                return 'Admin'
            }
            return undefined
        })
    })

    it('should render banner when eligible', () => {
        renderHook(useAiAgentTrialBanner)

        expect(mockedAddBanner).toHaveBeenCalledWith({
            preventDismiss: false,
            category: BannerCategories.AI_AGENT_TRIAL,
            instanceId: BannerCategories.AI_AGENT_TRIAL,
            type: AlertBannerTypes.Info,
            message:
                'Reduce your workload. Sell more. Let AI Agent handle up to 60% of tickets with personalized assistance.',
            CTA: {
                type: 'internal',
                text: 'Try it for free today',
                to: '/app/ai-agent/overview',
                onClick: expect.any(Function),
            },
        })
    })

    it('should not render if no Shopify store is connected', () => {
        useAppSelectorMock.mockImplementationOnce(() => [])
        renderHook(useAiAgentTrialBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })

    it('should not render when on tickets or views pages', () => {
        const { useLocation } = jest.requireMock('react-router-dom') as {
            useLocation: jest.Mock
        }
        useLocation.mockReturnValue({ pathname: '/app/tickets/123' })
        renderHook(useAiAgentTrialBanner)
        expect(mockedAddBanner).not.toHaveBeenCalled()
    })

    it('should not render if account has Automate (AI Agent subscription)', () => {
        // First selector call returns Shopify list
        useAppSelectorMock
            .mockImplementationOnce(() => [
                { id: 'shopify-1', meta: { shop_name: 'store1' } },
            ])
            // Second call is getHasAutomate -> true
            .mockImplementationOnce(() => true)
        renderHook(useAiAgentTrialBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })

    it('should not render if canSeeSystemBanner is false', () => {
        const { useTrialAccess } = jest.requireMock(
            'pages/aiAgent/trial/hooks/useTrialAccess',
        ) as { useTrialAccess: jest.Mock }
        useTrialAccess.mockReturnValue({
            canSeeSystemBanner: false,
            trialType: TrialType.AiAgent,
        })

        renderHook(useAiAgentTrialBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })

    it('should remove the banner when becoming ineligible', () => {
        const { useTrialAccess } = jest.requireMock(
            'pages/aiAgent/trial/hooks/useTrialAccess',
        ) as { useTrialAccess: jest.Mock }
        // First render eligible
        useTrialAccess.mockReturnValue({
            canSeeSystemBanner: true,
            trialType: TrialType.AiAgent,
        })
        const { rerender } = renderHook(useAiAgentTrialBanner)

        // Second render ineligible. Re-run the hook to trigger the new effect
        useTrialAccess.mockReturnValue({
            canSeeSystemBanner: false,
            trialType: TrialType.AiAgent,
        })
        rerender()
        expect(mockedRemoveBanner).toHaveBeenCalledWith(
            BannerCategories.AI_AGENT_TRIAL,
            BannerCategories.AI_AGENT_TRIAL,
        )
    })
})
