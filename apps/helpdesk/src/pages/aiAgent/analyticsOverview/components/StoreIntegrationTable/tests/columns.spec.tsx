import { STORE_INTEGRATION_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/StoreIntegrationTable/columns'

describe('STORE_INTEGRATION_COLUMNS', () => {
    it('has 7 entries', () => {
        expect(STORE_INTEGRATION_COLUMNS).toHaveLength(7)
    })

    it('has the correct accessorKeys in order', () => {
        expect(STORE_INTEGRATION_COLUMNS.map((col) => col.accessorKey)).toEqual(
            [
                'automationRate',
                'automatedInteractions',
                'handoverInteractions',
                'costSaved',
                'timeSaved',
                'decreaseInResolutionTime',
                'decreaseInFirstResponseTime',
            ],
        )
    })
})
