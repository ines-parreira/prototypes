import {useFlags} from 'launchdarkly-react-client-sdk'
import {
    FLOWS,
    ORDER_MANAGEMENT,
    ARTICLE_RECOMMENDATION,
    QUICK_RESPONSES,
} from 'pages/automate/common/components/constants'
import flowsIcon from 'assets/img/icons/flows.svg'
import orderManagementIcon from 'assets/img/icons/order-management.svg'
import {FeatureFlagKey} from 'config/featureFlags'

export default function useAutomationFeatures() {
    const sunsetQuickResponses = useFlags()[FeatureFlagKey.SunsetQuickResponses]
    return [
        {
            title: 'AI Agent',
            icon: 'auto_awesome',
            description: 'Your virtual agent for automatic support',
            disabled: !sunsetQuickResponses,
        },
        {
            title: FLOWS,
            iconUrl: flowsIcon,
            description: 'Build interactive, personalized resolutions',
        },
        {
            title: QUICK_RESPONSES,
            disabled: sunsetQuickResponses,
            icon: 'chat',
            description: 'Provide instant resolutions to FAQs',
        },
        {
            title: ORDER_MANAGEMENT,
            iconUrl: orderManagementIcon,
            description: 'Let customers manage and track orders',
        },
        {
            title: ARTICLE_RECOMMENDATION,
            icon: 'menu_book',
            description: 'Answer customer questions with AI',
        },
        {
            title: 'Autoresponders',
            icon: 'email',
            description: 'Filter and resolve email requests with AI',
        },
        {
            title: 'Automate statistics',
            icon: 'bar_chart',
            description: 'Measure and track your automation performance',
        },
    ]
}
