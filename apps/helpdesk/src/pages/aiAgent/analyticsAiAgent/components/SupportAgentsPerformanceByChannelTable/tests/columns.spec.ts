import { SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/columns'

describe('SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS', () => {
    it('has 5 entries', () => {
        expect(SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS).toHaveLength(5)
    })

    it('has the correct accessorKeys in order', () => {
        expect(
            SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS.map(
                (col) => col.accessorKey,
            ),
        ).toEqual([
            'automatedInteractions',
            'handoverInteractions',
            'timeSaved',
            'costSaved',
            'decreaseInFRT',
        ])
    })
})
