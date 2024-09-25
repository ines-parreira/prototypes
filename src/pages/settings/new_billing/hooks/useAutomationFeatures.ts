import {
    FLOWS,
    ORDER_MANAGEMENT,
    ARTICLE_RECOMMENDATION,
} from 'pages/automate/common/components/constants'
import flowsIcon from 'assets/img/icons/flows.svg'
import orderManagementIcon from 'assets/img/icons/order-management.svg'

export default function useAutomationFeatures() {
    return [
        {
            title: 'AI Agent',
            icon: 'auto_awesome',
            description: 'Your virtual agent for automated support',
        },
        {
            title: FLOWS,
            iconUrl: flowsIcon,
            description: 'Build interactive, personalized resolutions',
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
            title: 'Automate statistics',
            icon: 'bar_chart',
            description: 'Measure and track your automation performance',
        },
    ]
}
