import { FLOWS_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/FlowsTable/columns'

describe('FLOWS_COLUMNS', () => {
    it('has 5 entries', () => {
        expect(FLOWS_COLUMNS).toHaveLength(5)
    })

    it('has the correct accessorKeys in order', () => {
        expect(FLOWS_COLUMNS.map((col) => col.accessorKey)).toEqual([
            'automationRate',
            'automatedInteractions',
            'handoverInteractions',
            'costSaved',
            'timeSaved',
        ])
    })
})
