import { SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantPerformanceByEngagementFeatureTable/columns'
import { MAP_ENGAGEMENT_TYPE_NAME } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

describe('SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_COLUMNS', () => {
    it('has 6 entries', () => {
        expect(
            SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_COLUMNS,
        ).toHaveLength(6)
    })

    it('has the correct accessorKeys in order', () => {
        expect(
            SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_COLUMNS.map(
                (column) => column.accessorKey,
            ),
        ).toEqual([
            'automatedInteractions',
            'handoverInteractions',
            'conversionRate',
            'totalSales',
            'ordersInfluenced',
            'revenuePerInteraction',
        ])
    })
})

describe('MAP_ENGAGEMENT_TYPE_NAME', () => {
    it('maps the null bucket to Unknown', () => {
        expect(MAP_ENGAGEMENT_TYPE_NAME.null).toBe('Unknown')
    })
})
