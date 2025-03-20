import DynamicDiscount from 'assets/img/ai-agent/ai-agent_paywall_dynamic-discount.png'
import ProductRecommendations from 'assets/img/ai-agent/ai-agent_paywall_product-recommendations.png'
import SalesStrategy from 'assets/img/ai-agent/ai-agent_paywall_sales-strategy.png'
import type { ToggleElement } from 'pages/aiAgent/AiAgentPaywallView'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { assetsUrl } from 'utils'

export type PaywallFeature = {
    title: string
    subtitle: string
    descriptions: string[]
    toggleElements: ToggleElement[]
    contentSubtitle: string
    hideLearnMore?: boolean
    showRoiCalculator: boolean
}

export const usePaywallConfig = (
    aiAgentPaywallFeature: AIAgentPaywallFeatures,
): PaywallFeature => {
    switch (aiAgentPaywallFeature) {
        case AIAgentPaywallFeatures.Automate:
            return {
                title: 'with Automate features',
                subtitle:
                    "Introducing AI Agent - with Support and Sales skills, your team's newest member for seamless customer interactions.",
                descriptions: [
                    'Leads customers to fast resolutions in seconds, not hours.',
                    'Enhances team productivity, reducing workload & response times by automating up to 60% of your tickets.',
                    'Offers tailored discounts and product recommendations to drive personalized shopping experiences.',
                    'Automate features: Flows with logic to answer FAQs, suggest products, and manage orders by status.',
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
        case AIAgentPaywallFeatures.SalesWaitlist:
        default:
            return {
                title: 'for Sales',
                subtitle:
                    'Introducing AI Agent for Sales, your team’s newest member to drive conversion.',
                descriptions: [
                    'Provides 24/7 pre-sales assistance to guide shoppers, answer questions, and reduce drop-off.',
                    'Offers dynamic discounts to convert hesitant buyers without compromising margins.',
                    'Personalizes product recommendations using real-time data and customer input.',
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
        case AIAgentPaywallFeatures.SalesSetup:
            return {
                title: 'for Support & Sales',
                subtitle:
                    'Introducing AI Agent - with Support and Sales skills, your team’s newest member for seamless customer interactions.',
                descriptions: [
                    'Lead customers to fast resolutions in seconds, not hours.',
                    'Enhance team productivity, reducing workload & response times by automating up to 60% of your tickets.',
                    'Offer tailored discounts and product recommendations to drive personalized shopping experiences.',
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
    }
}
