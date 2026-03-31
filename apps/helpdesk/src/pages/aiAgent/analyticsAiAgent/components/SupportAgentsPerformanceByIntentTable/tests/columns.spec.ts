import { SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/columns'

describe('SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS', () => {
    it('has 5 entries', () => {
        expect(SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS).toHaveLength(5)
    })

    it('has the correct accessorKeys in order', () => {
        expect(
            SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS.map(
                (col) => col.accessorKey,
            ),
        ).toEqual([
            'automatedInteractions',
            'handoverInteractions',
            'successRate',
            'costSaved',
            'decreaseInFRT',
        ])
    })
})
