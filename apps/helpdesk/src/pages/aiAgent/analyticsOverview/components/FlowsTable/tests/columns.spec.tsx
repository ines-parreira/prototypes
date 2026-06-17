import { FLOWS_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/FlowsTable/columns'

describe('FLOWS_COLUMNS', () => {
    it('has 7 entries', () => {
        expect(FLOWS_COLUMNS).toHaveLength(7)
    })

    it('has the correct accessorKeys in order', () => {
        expect(FLOWS_COLUMNS.map((col) => col.accessorKey)).toEqual([
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
