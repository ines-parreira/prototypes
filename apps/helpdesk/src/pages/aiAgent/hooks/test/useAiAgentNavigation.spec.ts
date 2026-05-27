import {
    FeatureFlagKey,
    useFlag,
    useFlagWithLoading,
} from '@repo/feature-flags'
import { renderHook } from '@repo/testing'

import {
    ANALYTICS,
    CUSTOMER_ENGAGEMENT,
    PRODUCT_RECOMMENDATIONS,
    SALES,
    SKILLS,
    STRATEGY,
    TONE_OF_VOICE,
    TRAIN,
} from 'pages/aiAgent/constants'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding_V2/types'

import { useAiAgentNavigation } from '../useAiAgentNavigation'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
    useFlagWithLoading: jest.fn(
        (_flag: string, defaultValue: unknown = false) => ({
            value: defaultValue,
            isLoading: false,
        }),
    ),
}))
const mockUseFlag = jest.mocked(useFlag)
const mockUseFlagWithLoading = jest.mocked(useFlagWithLoading)

describe('useAiAgentNavigation', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiAgentKnowledgeTab || false,
        )
        mockUseFlagWithLoading.mockImplementation(
            (_flag, defaultValue = false) => ({
                value: defaultValue,
                isLoading: false,
            }),
        )
    })

    it('should get Knowledge General tab to navbar if AI agent scrape store domain feature flag is off', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        const trainItem = result.current.navigationItems.find(
            (item) => item.dataCanduId === 'ai-agent-navbar-train',
        )
        const knowledgeItem = trainItem?.items?.find(
            (item) => item.title === 'Knowledge',
        )
        expect(knowledgeItem).toEqual({
            route: '/app/ai-agent/shopify/test/knowledge',
            title: 'Knowledge',
            items: [
                {
                    route: '/app/ai-agent/shopify/test/knowledge',
                    title: 'General',
                    exact: true,
                },
            ],
        })
    })

    it('should get Knowledge Source tab to navbar if AI agent scrape store domain feature flag is on', () => {
        mockUseFlag.mockReturnValue({
            [FeatureFlagKey.AiAgentScrapeStoreDomain]: true,
        })

        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        const trainItem = result.current.navigationItems.find(
            (item) => item.dataCanduId === 'ai-agent-navbar-train',
        )
        const knowledgeItem = trainItem?.items?.find(
            (item) => item.title === 'Knowledge',
        )
        expect(knowledgeItem).toEqual({
            route: '/app/ai-agent/shopify/test/knowledge',
            title: 'Knowledge',
            items: [
                {
                    route: '/app/ai-agent/shopify/test/knowledge/sources',
                    title: 'Sources',
                    exact: false,
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

    it('should return /knowledge/sources?filter=guidance path', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )
        expect(result.current.routes.guidance).toEqual(
            '/app/ai-agent/shopify/test/knowledge/sources?filter=guidance',
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

    it('should return /sales/product-recommendations paths', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        expect(result.current.routes.productRecommendations).toEqual(
            '/app/ai-agent/shopify/test/sales/product-recommendations',
        )

        expect(result.current.routes.productRecommendationsPromote).toEqual(
            '/app/ai-agent/shopify/test/sales/product-recommendations/promote',
        )

        expect(result.current.routes.productRecommendationsExclude).toEqual(
            '/app/ai-agent/shopify/test/sales/product-recommendations/exclude',
        )
    })

    it('should return /tone-of-voice path', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        expect(result.current.routes.toneOfVoice).toEqual(
            '/app/ai-agent/shopify/test/tone-of-voice',
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

    it('should return /actions/edit/:id?tab=usage path for actionDetailTab usage tab', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        expect(result.current.routes.actionDetailTab('cfg-1', 'usage')).toEqual(
            '/app/ai-agent/shopify/test/actions/edit/cfg-1?tab=usage',
        )
    })

    it('should return /actions/edit/:id?tab=config path for actionDetailTab config tab', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        expect(
            result.current.routes.actionDetailTab('cfg-2', 'config'),
        ).toEqual('/app/ai-agent/shopify/test/actions/edit/cfg-2?tab=config')
    })

    it('should return /app/settings/integrations/app/:appId/actions path for appDetail', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )

        expect(result.current.routes.appDetail('app-123')).toEqual(
            '/app/settings/integrations/app/app-123/actions',
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

    it('should return correct paths for optimize', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )
        expect(result.current.routes.optimize).toBe(
            '/app/ai-agent/shopify/test/optimize',
        )
        expect(result.current.routes.optimizeIntent('123')).toBe(
            '/app/ai-agent/shopify/test/optimize/123',
        )
    })

    it('should return correct paths for intents', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )
        expect(result.current.routes.intents).toBe(
            '/app/ai-agent/shopify/test/intents',
        )
        expect(result.current.routes.intentsWithId('123')).toBe(
            '/app/ai-agent/shopify/test/intents/123',
        )
    })

    it('should return correct path for skills', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )
        expect(result.current.routes.skills).toBe(
            '/app/ai-agent/shopify/test/skills',
        )
    })

    describe('useNavigationItems', () => {
        it('should return ai-agent route for ai-agent set up when no step', () => {
            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'my-shop' }),
            )

            expect(result.current.routes.onboardingWizardStep()).toEqual(
                '/app/ai-agent/shopify/my-shop/onboarding',
            )
        })

        it('should return ai-agent route for ai-agent set up when step', () => {
            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'my-shop' }),
            )

            expect(
                result.current.routes.onboardingWizardStep(
                    WizardStepEnum.TONE_OF_VOICE,
                ),
            ).toEqual('/app/ai-agent/shopify/my-shop/onboarding/tone of voice')
        })

        it('should return ai-agent route for customer engagement', () => {
            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'my-shop' }),
            )

            const trainItem = result.current.navigationItems.find(
                (item) => item.dataCanduId === 'ai-agent-navbar-train',
            )
            const salesItems = trainItem?.items?.find(
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

        it('should return ai-agent route for strategy', () => {
            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'my-shop' }),
            )

            const trainItem = result.current.navigationItems.find(
                (item) => item.dataCanduId === 'ai-agent-navbar-train',
            )
            const salesItems = trainItem?.items?.find(
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

        it('should not return ai-agent route for analytics in sales items', () => {
            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'my-shop' }),
            )

            const trainItem = result.current.navigationItems.find(
                (item) => item.dataCanduId === 'ai-agent-navbar-train',
            )
            const salesItems = trainItem?.items?.find(
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

        it('should not return ai-agent route for product recommendations when product recommendations is disabled', () => {
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

        it('should not include sales navigation item when ShoppingAssistantEnforceDeactivation is enabled', () => {
            mockUseFlag.mockImplementation(
                (key) =>
                    key ===
                        FeatureFlagKey.ShoppingAssistantEnforceDeactivation ||
                    false,
            )

            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'my-shop' }),
            )

            const trainItem = result.current.navigationItems.find(
                (item) => item.dataCanduId === 'ai-agent-navbar-train',
            )
            const salesItem = trainItem?.items?.find(
                (item) => item.title === SALES,
            )

            expect(salesItem).toBeUndefined()
        })

        it('should include sales navigation item when ShoppingAssistantEnforceDeactivation is disabled', () => {
            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'my-shop' }),
            )

            const trainItem = result.current.navigationItems.find(
                (item) => item.dataCanduId === 'ai-agent-navbar-train',
            )
            const salesItem = trainItem?.items?.find(
                (item) => item.title === SALES,
            )

            expect(salesItem).toBeDefined()
            expect(salesItem?.title).toBe(SALES)
        })

        it('should include sales navigation item when ShoppingAssistantEnforceDeactivation is enabled but AiShoppingAssistantAbTesting is also enabled', () => {
            mockUseFlag.mockImplementation((key) => {
                if (
                    key === FeatureFlagKey.ShoppingAssistantEnforceDeactivation
                ) {
                    return true
                }
                if (key === FeatureFlagKey.AiShoppingAssistantAbTesting) {
                    return true
                }
                return false
            })

            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'my-shop' }),
            )

            const trainItem = result.current.navigationItems.find(
                (item) => item.dataCanduId === 'ai-agent-navbar-train',
            )
            const salesItem = trainItem?.items?.find(
                (item) => item.title === SALES,
            )

            expect(salesItem).toBeDefined()
            expect(salesItem?.title).toBe(SALES)
        })

        it('should include Tone of Voice in Train section when feature flag is enabled', () => {
            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.AiAgentToneOfVoice) {
                    return true
                }
                return false
            })

            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'test-shop' }),
            )

            const trainItem = result.current.navigationItems.find(
                (item) => item.title === TRAIN,
            )
            const toneOfVoiceItem = trainItem?.items?.find(
                (item) => item.title === TONE_OF_VOICE,
            )

            expect(toneOfVoiceItem).toBeDefined()
            expect(toneOfVoiceItem?.route).toBe(
                '/app/ai-agent/shopify/test-shop/tone-of-voice',
            )
        })

        it('should not include Tone of Voice when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'test-shop' }),
            )

            const trainItem = result.current.navigationItems.find(
                (item) => item.title === TRAIN,
            )
            const toneOfVoiceItem = trainItem?.items?.find(
                (item) => item.title === TONE_OF_VOICE,
            )

            expect(toneOfVoiceItem).toBeUndefined()
        })

        it('should include Skills in Train section when KnowledgeIntentManagementSystem feature flag is enabled', () => {
            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.KnowledgeIntentManagementSystem) {
                    return true
                }
                return false
            })

            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'test-shop' }),
            )

            const trainItem = result.current.navigationItems.find(
                (item) => item.title === TRAIN,
            )
            const skillsItem = trainItem?.items?.find(
                (item) => item.title === SKILLS,
            )

            expect(skillsItem).toBeDefined()
            expect(skillsItem?.route).toBe(
                '/app/ai-agent/shopify/test-shop/skills',
            )
            expect(skillsItem?.dataCanduId).toBe('ai-agent-navbar-skills')
            expect(skillsItem?.exact).toBe(false)
        })

        it('should not include Skills when KnowledgeIntentManagementSystem feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'test-shop' }),
            )

            const trainItem = result.current.navigationItems.find(
                (item) => item.title === TRAIN,
            )
            const skillsItem = trainItem?.items?.find(
                (item) => item.title === SKILLS,
            )

            expect(skillsItem).toBeUndefined()
        })
    })
})
