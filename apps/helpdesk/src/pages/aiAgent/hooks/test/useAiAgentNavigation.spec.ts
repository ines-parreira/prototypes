import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'

import {
    ANALYTICS,
    CUSTOMER_ENGAGEMENT,
    PROCEDURES,
    PRODUCT_RECOMMENDATIONS,
    SALES,
    STRATEGY,
    TONE_OF_VOICE,
    TRAIN,
} from 'pages/aiAgent/constants'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'

import { useAiAgentNavigation } from '../useAiAgentNavigation'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)

describe('useAiAgentNavigation', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiAgentKnowledgeTab || false,
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
                {
                    route: '/app/ai-agent/shopify/test/knowledge/guidance',
                    title: 'Guidance',
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

    it('should return correct path for procedures', () => {
        const { result } = renderHook(() =>
            useAiAgentNavigation({ shopName: 'test' }),
        )
        expect(result.current.routes.procedures).toBe(
            '/app/ai-agent/shopify/test/procedures',
        )
    })

    describe('useNavigationItems', () => {
        describe('when AiShoppingAssistantEnabled=false', () => {
            beforeEach(() => {
                mockUseFlag.mockImplementation(
                    (key) =>
                        key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                        false,
                )
            })

            it('should return ai-agent route for ai-agent support set up', () => {
                const { result } = renderHook(() =>
                    useAiAgentNavigation({ shopName: 'my-shop' }),
                )

                expect(result.current.routes.onboardingWizardStep()).toEqual(
                    '/app/ai-agent/shopify/my-shop/onboarding',
                )
            })
        })

        describe('when AiShoppingAssistantEnabled=true', () => {
            beforeEach(() => {
                mockUseFlag.mockImplementation(
                    (key) =>
                        key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                        false,
                )
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
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

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

        it('should return ai-agent route for strategy when ai shopping assistant is enabled', () => {
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

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
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

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

        it('should return ai-agent route for strategy when ai shopping assistant is enabled', () => {
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

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

        it('should not return ai-agent route for product recommendations when ai shopping assistant is enabled but product recommendations is disabled', () => {
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

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
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled ||
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
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
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

            expect(salesItem).toBeDefined()
            expect(salesItem?.title).toBe(SALES)
        })

        it('should include sales navigation item when ShoppingAssistantEnforceDeactivation is enabled but AiShoppingAssistantAbTesting is also enabled', () => {
            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.AiShoppingAssistantEnabled) {
                    return true
                }
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

        it('should include Procedures in Train section when KnowledgeIntentManagementSystem feature flag is enabled', () => {
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
            const proceduresItem = trainItem?.items?.find(
                (item) => item.title === PROCEDURES,
            )

            expect(proceduresItem).toBeDefined()
            expect(proceduresItem?.route).toBe(
                '/app/ai-agent/shopify/test-shop/procedures',
            )
            expect(proceduresItem?.dataCanduId).toBe(
                'ai-agent-navbar-procedures',
            )
            expect(proceduresItem?.exact).toBe(true)
        })

        it('should not include Procedures when KnowledgeIntentManagementSystem feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            const { result } = renderHook(() =>
                useAiAgentNavigation({ shopName: 'test-shop' }),
            )

            const trainItem = result.current.navigationItems.find(
                (item) => item.title === TRAIN,
            )
            const proceduresItem = trainItem?.items?.find(
                (item) => item.title === PROCEDURES,
            )

            expect(proceduresItem).toBeUndefined()
        })
    })
})
