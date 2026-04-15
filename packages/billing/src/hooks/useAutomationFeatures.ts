export const FLOWS = 'Flows'
export const ORDER_MANAGEMENT = 'Order Management'
export const ARTICLE_RECOMMENDATION = 'Article Recommendation'

type AutomationFeature = {
    title: string
    icon?: string
    iconUrl?: string
    description: string
}

export default function useAutomationFeatures(): AutomationFeature[] {
    return [
        {
            title: 'AI Agent',
            icon: 'auto_awesome',
            description: 'Your virtual agent for automated support',
        },
        {
            title: FLOWS,
            icon: 'account_tree',
            description: 'Build interactive, personalized resolutions',
        },
        {
            title: ORDER_MANAGEMENT,
            icon: 'shopping_cart',
            description: 'Let customers manage and track orders',
        },
        {
            title: ARTICLE_RECOMMENDATION,
            icon: 'menu_book',
            description: 'Answer customer questions with AI',
        },
        {
            title: 'Automation statistics',
            icon: 'bar_chart',
            description: 'Measure and track your automation performance',
        },
    ]
}
