import { ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/columns'

describe('ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS', () => {
    it('has 5 entries', () => {
        expect(ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS).toHaveLength(5)
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
            'costSaved',
        ])
    })
})
