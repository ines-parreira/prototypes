import { renderHook } from '@repo/testing'

import DynamicDiscount from 'assets/img/ai-agent/ai-agent_paywall_dynamic-discount.png'
import ProductRecommendations from 'assets/img/ai-agent/ai-agent_paywall_product-recommendations.png'
import SalesStrategy from 'assets/img/ai-agent/ai-agent_paywall_sales-strategy.png'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { assetsUrl } from 'utils'

import { PaywallFeature, usePaywallConfig } from '../usePaywallConfig'

jest.mock('utils')

const mockAssetsUrl = assetsUrl as jest.MockedFunction<typeof assetsUrl>

describe('usePaywallConfig', () => {
    beforeEach(() => {
        mockAssetsUrl.mockImplementation(
            (path: string) => `https://mockedurl.com${path}`,
        )
    })

    it('should return the correct config for AIAgentPaywallFeatures.Automate', () => {
        const { result } = renderHook(() =>
            usePaywallConfig(AIAgentPaywallFeatures.Automate),
        )

        const expectedConfig: PaywallFeature = {
            title: '',
            subtitle:
                'Introducing AI Agent: Your new team member that drives sales and automates support in 1:1 conversations.',
            descriptions: [
                'Leads customers to fast resolutions in seconds, not hours.',
                'Enhances team productivity, reducing workload & response times by automating up to 60% of your tickets.',
                'Offers tailored discounts and product recommendations to drive personalized shopping experiences.',
            ],
            toggleElements: [
                {
                    title: 'Support',
                    contentSrc: assetsUrl(
                        '/video/ai-agent_paywall_support.mp4',
                    ),
                    type: 'video',
                },
                {
                    title: 'Sales',
                    contentSrc: SalesStrategy,
                    type: 'image',
                },
            ],
            contentSubtitle: 'AI Agent Skills',
            hideLearnMore: false,
            showRoiCalculator: true,
        }

        expect(result.current).toEqual(expectedConfig)
    })

    it('should return the correct config for AIAgentPaywallFeatures.SalesWaitlist', () => {
        const { result } = renderHook(() =>
            usePaywallConfig(AIAgentPaywallFeatures.SalesWaitlist),
        )

        const expectedConfig: PaywallFeature = {
            title: 'Shopping Assistant',
            subtitle:
                'Introducing Shopping Assistant, your team’s newest member to drive conversion. ',
            descriptions: [
                'Proactively engage with shoppers at key moments',
                'Personalize product recommendations powered by rich customer insights',
                'Maximize cart size with intelligent upsells',
                'Offer discounts based on purchase intent',
            ],
            toggleElements: [
                {
                    title: 'Sales Strategy',
                    contentSrc: SalesStrategy,
                    type: 'image',
                },
                {
                    title: 'Dynamic Discount',
                    contentSrc: DynamicDiscount,
                    type: 'image',
                },
                {
                    title: 'Product Recommendations',
                    contentSrc: ProductRecommendations,
                    type: 'image',
                },
            ],
            contentSubtitle: 'Sales features',
            hideLearnMore: true,
            showRoiCalculator: false,
        }

        expect(result.current).toEqual(expectedConfig)
    })

    it('should return the correct config for AIAgentPaywallFeatures.TrialSetup', () => {
        const { result } = renderHook(() =>
            usePaywallConfig(AIAgentPaywallFeatures.TrialSetup),
        )

        const expectedConfig: PaywallFeature = {
            title: '',
            subtitle:
                'Introducing AI Agent with Shopping Assistant: Your new team member that drives sales and automates support in 1:1 conversations.',
            descriptions: [
                'Leads customers to fast resolutions in seconds, not hours.',
                'Enhances team productivity, reducing workload & response times by automating up to 60% of your tickets.',
                'Offers tailored discounts and product recommendations to drive personalized shopping experiences.',
            ],
            toggleElements: [
                {
                    title: 'Support',
                    contentSrc: assetsUrl(
                        '/video/ai-agent_paywall_support.mp4',
                    ),
                    type: 'video',
                },
                {
                    title: 'Sales',
                    contentSrc: SalesStrategy,
                    type: 'image',
                },
            ],
            contentSubtitle: 'AI Agent Skills',
            hideLearnMore: true,
            showRoiCalculator: false,
        }

        expect(result.current).toEqual(expectedConfig)
    })
})
