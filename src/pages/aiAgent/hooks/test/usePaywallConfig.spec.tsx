import DynamicDiscount from 'assets/img/ai-agent/ai-agent_paywall_dynamic-discount.png'
import ProductRecommendations from 'assets/img/ai-agent/ai-agent_paywall_product-recommendations.png'
import SalesStrategy from 'assets/img/ai-agent/ai-agent_paywall_sales-strategy.png'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { assetsUrl } from 'utils'
import { renderHook } from 'utils/testing/renderHook'

import { PaywallFeature, usePaywallConfig } from '../usePaywallConfig'

jest.mock('launchdarkly-react-client-sdk')
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
                'AI Agent features: Flows with logic to answer FAQs, suggest products, and manage orders by status.',
            ],
            toggleElements: [
                {
                    title: 'Support Agent',
                    contentSrc: assetsUrl(
                        '/video/ai-agent_paywall_support.mp4',
                    ),
                    type: 'video',
                },
                {
                    title: 'Shopping Assistant',
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
            title: 'with Shopping Assistant skills',
            subtitle:
                'Sell more with a Shopping Assistant that drives conversions and elevates the shopping experience.',
            descriptions: [
                'Offer 24/7 tailored assistance to guide shoppers, answer questions, and reduce drop-off',
                'Offer smart discounts to convert shoppers while protecting margins',
                'Personalize product recommendations with historical purchase data and real-time browsing behavior',
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

    it('should return the correct config for AIAgentPaywallFeatures.SalesSetup', () => {
        const { result } = renderHook(() =>
            usePaywallConfig(AIAgentPaywallFeatures.SalesSetup),
        )

        const expectedConfig: PaywallFeature = {
            title: '',
            subtitle:
                'Introducing AI Agent: Your new team member that drives sales and automates support in 1:1 conversations.',
            descriptions: [
                'Stay available 24/7 across chat, email, and more — without extra headcount',
                'Automate FAQs and order updates so your team can focus on high-impact work',
                'Convert more with tailored product recommendations and smart discounts based on real-time data',
                'Train the AI to match your brand voice, policies, and sales strategy',
            ],
            toggleElements: [
                {
                    title: 'Support Agent',
                    contentSrc: assetsUrl(
                        '/video/ai-agent_paywall_support.mp4',
                    ),
                    type: 'video',
                },
                {
                    title: 'Shopping Assistant',
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

    it('should return the correct config for AIAgentPaywallFeatures.AutomateChat', () => {
        const { result } = renderHook(() =>
            usePaywallConfig('' as AIAgentPaywallFeatures),
        )

        const expectedConfig: PaywallFeature = {
            title: '',
            subtitle:
                'Introducing AI Agent: Your new team member that drives sales and automates support in 1:1 conversations.',
            descriptions: [
                'Leads customers to fast resolutions in seconds, not hours.',
                'Enhances team productivity, reducing workload & response times by automating up to 60% of your tickets.',
                'Offers tailored discounts and product recommendations to drive personalized shopping experiences.',
                'AI Agent features: Flows with logic to answer FAQs, suggest products, and manage orders by status.',
            ],
            toggleElements: [
                {
                    title: 'Support Agent',
                    contentSrc: assetsUrl(
                        '/video/ai-agent_paywall_support.mp4',
                    ),
                    type: 'video',
                },
                {
                    title: 'Shopping Assistant',
                    contentSrc: SalesStrategy,
                    type: 'image',
                },
            ],
            contentSubtitle: 'AI Agent Skills',
            hideLearnMore: false,
            showRoiCalculator: true,
        }

        expect(result.current).toMatchObject(expectedConfig)
    })
})
