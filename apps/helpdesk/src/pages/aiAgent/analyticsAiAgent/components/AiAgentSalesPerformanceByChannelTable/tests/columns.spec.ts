import { AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/columns'

describe('AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS', () => {
    it('has 5 entries', () => {
        expect(AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS).toHaveLength(5)
    })

    it('has the correct accessorKeys in order', () => {
        expect(
            AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS.map(
                (col) => col.accessorKey,
            ),
        ).toEqual([
            'automatedInteractions',
            'handoverInteractions',
            'totalSales',
            'ordersInfluenced',
            'revenuePerInteraction',
        ])
    })
})
