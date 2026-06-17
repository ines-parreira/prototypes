import { PERFORMANCE_BREAKDOWN_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/columns'

describe('PERFORMANCE_BREAKDOWN_COLUMNS', () => {
    it('has 7 entries', () => {
        expect(PERFORMANCE_BREAKDOWN_COLUMNS).toHaveLength(7)
    })

    it('has the correct accessorKeys in order', () => {
        expect(
            PERFORMANCE_BREAKDOWN_COLUMNS.map((col) => col.accessorKey),
        ).toEqual([
            'automationRate',
            'automatedInteractions',
            'handoverInteractions',
            'costSaved',
            'timeSaved',
            'decreaseInResolutionTime',
            'decreaseInFirstResponseTime',
        ])
    })
})
