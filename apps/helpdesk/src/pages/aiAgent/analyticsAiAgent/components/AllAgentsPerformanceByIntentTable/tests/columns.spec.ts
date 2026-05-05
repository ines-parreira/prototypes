import { ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/columns'

describe('ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS', () => {
    it('has 6 entries', () => {
        expect(ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS).toHaveLength(6)
    })

    it('has the correct accessorKeys in order', () => {
        expect(
            ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS.map(
                (col) => col.accessorKey,
            ),
        ).toEqual([
            'automatedInteractions',
            'handoverInteractions',
            'coverageRate',
            'successRate',
            'conversionRate',
            'costSaved',
        ])
    })
})
