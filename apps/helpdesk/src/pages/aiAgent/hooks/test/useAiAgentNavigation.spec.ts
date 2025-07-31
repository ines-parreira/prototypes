import { renderHook } from '@repo/testing'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import {
    ANALYTICS,
    CUSTOMER_ENGAGEMENT,
    PRODUCT_RECOMMENDATIONS,
    SALES,
    STRATEGY,
} from 'pages/aiAgent/constants'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { assumeMock } from 'utils/testing'

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

    it('should return /sales/product-recommendations/exclude path', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        expect(result.current.routes.productRecommendationsExclude).toEqual(
            '/app/ai-agent/shopify/test/sales/product-recommendations/exclude',
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
            '/app/ai-agent/shopify/test/knowledge/sources/url-articles/42/articles',
        )
        expect(result.current.routes.fileArticles(99)).toBe(
            '/app/ai-agent/shopify/test/knowledge/sources/file-articles/99/articles',
        )
    })

    it('should return correct urlArticlesDetail and fileArticlesDetail paths', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        expect(result.current.routes.urlArticlesDetail(42, 7)).toBe(
            '/app/ai-agent/shopify/test/knowledge/sources/url-articles/42/articles/7',
        )
        expect(result.current.routes.fileArticlesDetail(99, 14)).toBe(
            '/app/ai-agent/shopify/test/knowledge/sources/file-articles/99/articles/14',
        )
    })

    describe('useNavigationItems', () => {
        describe('when AiShoppingAssistantEnabled=false', () => {
            beforeEach(() => {
                useFlagsMock.mockReturnValue({
                    [FeatureFlagKey.AiShoppingAssistantEnabled]: false,
                })
            })

            it('should return ai-agent route for ai-agent support set up', () => {
                const { result } = renderHook(() =>
                    useAiAgentNavigation({ shopName: 'my-shop' }),
                )

                expect(result.current.routes.onboardingWizardStep()).toEqual(
                    '/app/ai-agent/shopify/my-shop/new',
                )
            })
        })

        describe('when AiShoppingAssistantEnabled=true', () => {
            beforeEach(() => {
                useFlagsMock.mockReturnValue({
                    [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                })
            })

            it('should return ai-agent route for ai-agent sales set up when no step', () => {
                const { result } = renderHook(() =>
                    useAiAgentNavigation({ shopName: 'my-shop' }),
                )

                expect(result.current.routes.onboardingWizardStep()).toEqual(
                    '/app/ai-agent/shopify/my-shop/onboarding',
                )
            })

            it('should return ai-agent route for ai-agent sales set up when step', () => {
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

        it('should return ai-agent route for customer engagement when ai shopping assistant is enabled', () => {
            useFlagsMock.mockReturnValue({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
            })

            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'my-shop' }),
            )

            const salesItems = result.current.navigationItems.find(
                (item) => item.title === SALES,
            )?.items

            expect(salesItems).toEqual(
                expect.arrayContaining([
                    {
                        route: '/app/ai-agent/shopify/my-shop/sales/customer-engagement',
                        title: CUSTOMER_ENGAGEMENT,
                        exact: true,
                    },
                ]),
            )
        })

        it('should return ai-agent route for analytics when ai shopping assistant is enabled and action driven ai agent navbar is disabled', () => {
            useFlagsMock.mockReturnValue({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                [FeatureFlagKey.ActionDrivenAiAgentNavigation]: false,
            })

            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'my-shop' }),
            )

            const salesItems = result.current.navigationItems.find(
                (item) => item.title === SALES,
            )?.items

            expect(salesItems).toEqual(
                expect.arrayContaining([
                    {
                        route: '/app/ai-agent/shopify/my-shop/sales/analytics',
                        title: ANALYTICS,
                        exact: true,
                    },
                ]),
            )
        })

        it('should not return ai-agent route for analytics when action driven ai agent navbar is enabled', () => {
            useFlagsMock.mockReturnValue({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                [FeatureFlagKey.ActionDrivenAiAgentNavigation]: true,
            })

            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'my-shop' }),
            )

            const salesItems = result.current.navigationItems.find(
                (item) => item.title === SALES,
            )?.items

            expect(salesItems).not.toEqual(
                expect.arrayContaining([
                    {
                        route: '/app/ai-agent/shopify/my-shop/sales/analytics',
                        title: ANALYTICS,
                        exact: true,
                    },
                ]),
            )
        })

        it('should return ai-agent route for strategy when ai shopping assistant is enabled', () => {
            useFlagsMock.mockReturnValue({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
            })

            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'my-shop' }),
            )

            const salesItems = result.current.navigationItems.find(
                (item) => item.title === SALES,
            )?.items

            expect(salesItems).toEqual(
                expect.arrayContaining([
                    {
                        route: '/app/ai-agent/shopify/my-shop/sales/strategy',
                        title: STRATEGY,
                        exact: true,
                    },
                ]),
            )
        })

        it('should return ai-agent route for product recommendations when ai shopping assistant and product recommendations are enabled', () => {
            useFlagsMock.mockReturnValue({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                [FeatureFlagKey.AiShoppingAssistantProductRecommendations]: true,
            })

            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'my-shop' }),
            )

            const salesItems = result.current.navigationItems.find(
                (item) => item.title === SALES,
            )?.items

            expect(salesItems).toEqual(
                expect.arrayContaining([
                    {
                        route: '/app/ai-agent/shopify/my-shop/sales/product-recommendations/exclude',
                        title: PRODUCT_RECOMMENDATIONS,
                        exact: true,
                    },
                ]),
            )
        })

        it('should not return ai-agent route for product recommendations when ai shopping assistant is enabled but product recommendations is disabled', () => {
            useFlagsMock.mockReturnValue({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                [FeatureFlagKey.AiShoppingAssistantProductRecommendations]: false,
            })

            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'my-shop' }),
            )

            const salesItems = result.current.navigationItems.find(
                (item) => item.title === SALES,
            )?.items

            const productRecommendationsItem = salesItems?.find(
                (item) => item.title === PRODUCT_RECOMMENDATIONS,
            )

            expect(productRecommendationsItem).toBeUndefined()
        })

        it('should not return ai-agent route for sales when ai shopping assistant is disabled', () => {
            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'my-shop' }),
            )

            const salesItems = result.current.navigationItems.find(
                (item) => item.title === SALES,
            )?.items

            expect(salesItems).toBeUndefined()
        })

        it('should not include sales navigation item when ShoppingAssistantEnforceDeactivation is enabled', () => {
            useFlagsMock.mockReturnValue({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                [FeatureFlagKey.ShoppingAssistantEnforceDeactivation]: true,
            })

            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'my-shop' }),
            )

            const salesItem = result.current.navigationItems.find(
                (item) => item.title === SALES,
            )

            expect(salesItem).toBeUndefined()
        })

        it('should include sales navigation item when ShoppingAssistantEnforceDeactivation is disabled', () => {
            useFlagsMock.mockReturnValue({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
                [FeatureFlagKey.ShoppingAssistantEnforceDeactivation]: false,
            })

            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'my-shop' }),
            )

            const salesItem = result.current.navigationItems.find(
                (item) => item.title === SALES,
            )

            expect(salesItem).toBeDefined()
            expect(salesItem?.title).toBe(SALES)
        })
    })
})
