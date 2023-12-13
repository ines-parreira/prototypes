import {assetsUrl} from 'utils'
import {CarouselData} from 'pages/common/components/HeroImageCarousel/HeroImageCarousel'
import {AutomateFeatures} from '../types'

export const AUTOMATION_NAVBAR_COLLAPSED_AAO_SECTIONS_KEY =
    'automation:navbar:collapsed-aao-sections'
export const MAX_EXPANDED_AAO_SECTIONS_BY_DEFAULT = 3
export const MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS = 6
export const ARTICLE_RECOMMENDATION = 'Article Recommendation'
export const ORDER_MANAGEMENT = 'Order Management'
export const QUICK_RESPONSES = 'Quick Responses'
export const FLOWS = 'Flows'
export const CHANNELS = 'Channels'
export const TRAIN_MY_AI = 'Train My AI'

export type PaywallFeature = {
    headerTitle: string
    greyButtonText: string
    primaryButtonText: string
    paywallTitle: string
    descriptions: string[]
    slidesData: CarouselData[]
}

export const PaywallConfig: Record<AutomateFeatures, PaywallFeature> = {
    [AutomateFeatures.Automate]: {
        headerTitle: 'Automate',
        greyButtonText: 'Learn more',
        primaryButtonText: 'Select plan to get started',
        paywallTitle:
            'Instant resolutions for happier customers and a happier team',
        descriptions: [
            'Resolve up to 50% of requests with AI and automation.',
            'Save agent time for more personalized customer care.',
            'Save on costs while offering 24/7 support that scales.',
            'Automate email, Chat, Help Center, and Contact Form.',
        ],
        slidesData: [
            {
                imageUrl: assetsUrl(
                    '/img/paywalls/screens/automate_paywall_flows.png'
                ),
                description:
                    'Build personalized, automated interactions with Flows and Quick Responses.',
            },
            {
                imageUrl: assetsUrl(
                    '/img/paywalls/screens/automate_paywall_article_recommendation.png'
                ),
                description: 'Recommend Help Center articles with AI.',
            },
            {
                imageUrl: assetsUrl(
                    '/img/paywalls/screens/automate_paywall_order_management.png'
                ),
                description:
                    'Let customers manage and track orders on your Chat, Help Center, and Contact Form.',
            },
            {
                imageUrl: assetsUrl(
                    '/img/paywalls/screens/automate_paywall_autoresponders.png'
                ),
                description:
                    'Leverage AI Autoresponders to reduce and resolve emails tickets.',
            },
            {
                imageUrl: assetsUrl(
                    '/img/paywalls/screens/automate_paywall_statistics.png'
                ),
                description:
                    'Track performance and improve your automations with dedicated statistics',
            },
        ],
    },
    [AutomateFeatures.AutomateStats]: {
        headerTitle: 'Automate overview',
        greyButtonText: 'Learn more',
        primaryButtonText: 'Select plan to get started',
        paywallTitle:
            'Instant resolutions for happier customers and a happier team',
        descriptions: [
            'Resolve up to 50% of requests with AI and automation.',
            'Save agent time for more personalized customer care.',
            'Save on costs while offering 24/7 support that scales.',
            'Automate email, Chat, Help Center, and Contact Form.',
        ],
        slidesData: [
            {
                imageUrl: assetsUrl(
                    '/img/paywalls/screens/automate_paywall_statistics.png'
                ),
                description:
                    'Track performance and improve your automations with dedicated statistics',
            },
            {
                imageUrl: assetsUrl(
                    '/img/paywalls/screens/automate_paywall_flows.png'
                ),
                description:
                    'Build personalized, automated interactions with Flows and Quick Responses.',
            },
            {
                imageUrl: assetsUrl(
                    '/img/paywalls/screens/automate_paywall_article_recommendation.png'
                ),
                description: 'Recommend Help Center articles with AI.',
            },
            {
                imageUrl: assetsUrl(
                    '/img/paywalls/screens/automate_paywall_order_management.png'
                ),
                description:
                    'Let customers manage and track orders on your Chat, Help Center, and Contact Form.',
            },
            {
                imageUrl: assetsUrl(
                    '/img/paywalls/screens/automate_paywall_autoresponders.png'
                ),
                description:
                    'Leverage AI Autoresponders to reduce and resolve emails tickets.',
            },
        ],
    },
}
