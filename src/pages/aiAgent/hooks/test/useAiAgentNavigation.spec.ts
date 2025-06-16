import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useAiAgentNavigation } from '../useAiAgentNavigation'

jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlag: jest.fn(),
}))
const useFlagsMock = assumeMock(useFlags)

describe('useAiAgentNavigation', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.AiAgentKnowledgeTab]: false,
            [FeatureFlagKey.FollowUpAiAgentPreviewMode]: true,
        })
    })

    it('should get Knowledge General tab to navbar if AI agent scrape store domain feature flag is off', () => {
        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.AiAgentKnowledgeTab]: true,
            [FeatureFlagKey.AiAgentScrapeStoreDomain]: false,
        })

        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        const knowledgeItem = result.current.navigationItems.find(
            (item) => item.dataCanduId === 'ai-agent-navbar-knowledge',
        )
        expect(knowledgeItem).toEqual({
            route: '/app/ai-agent/shopify/test/knowledge',
            title: 'Knowledge',
            dataCanduId: 'ai-agent-navbar-knowledge',
            items: [
                {
                    route: '/app/ai-agent/shopify/test/knowledge',
                    title: 'General',
                    exact: true,
                },
                {
                    route: '/app/ai-agent/shopify/test/knowledge/guidance',
                    title: 'Guidance',
                },
            ],
        })
    })

    it('should get Knowledge Source tab to navbar if AI agent scrape store domain feature flag is on', () => {
        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.AiAgentKnowledgeTab]: true,
            [FeatureFlagKey.AiAgentScrapeStoreDomain]: true,
        })

        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        const knowledgeItem = result.current.navigationItems.find(
            (item) => item.dataCanduId === 'ai-agent-navbar-knowledge',
        )
        expect(knowledgeItem).toEqual({
            route: '/app/ai-agent/shopify/test/knowledge',
            title: 'Knowledge',
            dataCanduId: 'ai-agent-navbar-knowledge',
            items: [
                {
                    route: '/app/ai-agent/shopify/test/knowledge/sources',
                    title: 'Sources',
                    exact: false,
                },
                {
                    route: '/app/ai-agent/shopify/test/knowledge/guidance',
                    title: 'Guidance',
                },
            ],
        })
    })

    it('should contain the overview page route', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        expect(result.current.routes.overview).toBe('/app/ai-agent/overview')
    })

    it('should return /knowledge/guidance path', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )
        expect(result.current.routes.guidance).toEqual(
            '/app/ai-agent/shopify/test/knowledge/guidance',
        )
    })

    it('should return /settings/preview path when user is a Gorgias user', () => {
        window.USER_IMPERSONATED = true

        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        expect(result.current.routes.previewMode).toEqual(
            '/app/ai-agent/shopify/test/settings/preview',
        )
    })

    it('should return /sales path when user is a Gorgias user', () => {
        window.USER_IMPERSONATED = true

        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        expect(result.current.routes.sales).toEqual(
            '/app/ai-agent/shopify/test/sales',
        )
    })

    it('should return /sales/analytics path when the AiShoppingAssistantEnabled feature-flag is enabled', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        expect(result.current.routes.analytics).toEqual(
            '/app/ai-agent/shopify/test/sales/analytics',
        )
    })

    it('should return /actions/new?template_id=1 path', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        expect(result.current.routes.newAction('1')).toEqual(
            '/app/ai-agent/shopify/test/actions/new?template_id=1',
        )
    })

    it('should return correct urlArticles and fileArticles paths', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        expect(result.current.routes.urlArticles(42)).toBe(
            '/app/ai-agent/shopify/test/knowledge/sources/url-articles/42',
        )
        expect(result.current.routes.fileArticles(99)).toBe(
            '/app/ai-agent/shopify/test/knowledge/sources/file-articles/99',
        )
    })

    describe('useNavigationItems', () => {
        describe('when AiShoppingAssistantEnabled=false', () => {
            it('should return ai-agent route for ai-agent support set up', () => {
                useFlagsMock.mockReturnValue({
                    [FeatureFlagKey.AiShoppingAssistantEnabled]: false,
                })
                const { result } = renderHook(() =>
                    useAiAgentNavigation({ shopName: 'my-shop' }),
                )

                expect(result.current.routes.onboardingWizardStep()).toEqual(
                    '/app/ai-agent/shopify/my-shop/new',
                )
            })
        })

        describe('when AiShoppingAssistantEnabled=true', () => {
            it('should return ai-agent route for ai-agent sales set up when no step', () => {
                useFlagsMock.mockReturnValue({
                    [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                })
                const { result } = renderHook(() =>
                    useAiAgentNavigation({ shopName: 'my-shop' }),
                )

                expect(result.current.routes.onboardingWizardStep()).toEqual(
                    '/app/ai-agent/shopify/my-shop/onboarding',
                )
            })

            it('should return ai-agent route for ai-agent sales set up when step', () => {
                useFlagsMock.mockReturnValue({
                    [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                })
                const { result } = renderHook(() =>
                    useAiAgentNavigation({ shopName: 'my-shop' }),
                )

                expect(
                    result.current.routes.onboardingWizardStep(
                        WizardStepEnum.CHANNELS,
                    ),
                ).toEqual('/app/ai-agent/shopify/my-shop/onboarding/channels')
            })
        })
    })
})
