import { ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/columns'

describe('ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS', () => {
    it('has 6 entries', () => {
        expect(ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS).toHaveLength(6)
    })

    it('has the correct accessorKeys in order', () => {
        expect(
            ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS.map(
                (col) => col.accessorKey,
            ),
        ).toEqual([
            'automatedInteractions',
            'handoverInteractions',
            'conversionRate',
            'coverageRate',
            'successRate',
            'costSaved',
        ])
    })
})
