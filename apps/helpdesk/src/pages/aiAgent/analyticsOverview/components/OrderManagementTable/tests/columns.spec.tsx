import {
    ENTITY_DISPLAY_NAMES,
    ORDER_MANAGEMENT_COLUMNS,
} from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/columns'

describe('ORDER_MANAGEMENT_COLUMNS', () => {
    it('has 5 entries', () => {
        expect(ORDER_MANAGEMENT_COLUMNS).toHaveLength(5)
    })

    it('has the correct accessorKeys in order', () => {
        expect(ORDER_MANAGEMENT_COLUMNS.map((col) => col.accessorKey)).toEqual([
            'automationRate',
            'automatedInteractions',
            'handoverInteractions',
            'costSaved',
            'timeSaved',
        ])
    })
})

describe('ENTITY_DISPLAY_NAMES', () => {
    it('has a display name for every entity key', () => {
        const keys = Object.keys(ENTITY_DISPLAY_NAMES)
        expect(keys).toEqual([
            'cancel_order',
            'track_order',
            'loop_returns_started',
            'automated_response_started',
        ])
    })

    it('has non-empty display names for all entities', () => {
        Object.values(ENTITY_DISPLAY_NAMES).forEach((name) => {
            expect(name.length).toBeGreaterThan(0)
        })
    })
})
