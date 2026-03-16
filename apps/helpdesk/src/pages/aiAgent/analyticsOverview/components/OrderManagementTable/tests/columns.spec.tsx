import { render, screen } from '@testing-library/react'

import {
    buildEntityColumnDef,
    buildMetricColumnDefs,
    ENTITY_DISPLAY_NAMES,
    ORDER_MANAGEMENT_COLUMNS,
} from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/columns'

const defaultLoadingStates = {
    automationRate: false,
    automatedInteractions: false,
    handoverInteractions: false,
    timeSaved: false,
    costSaved: false,
}

describe('buildEntityColumnDef', () => {
    it('returns a column def with accessorKey entity', () => {
        const columnDef = buildEntityColumnDef()

        expect((columnDef as any).accessorKey).toBe('entity')
    })

    it('returns a column def with enableHiding false', () => {
        const columnDef = buildEntityColumnDef()

        expect((columnDef as any).enableHiding).toBe(false)
    })

    it('returns a column def with displayName Feature name', () => {
        const columnDef = buildEntityColumnDef()

        expect((columnDef.meta as any).displayName).toBe('Feature name')
    })

    it.each(Object.entries(ENTITY_DISPLAY_NAMES))(
        'cell renders display name for entity %s',
        (entity, displayName) => {
            const columnDef = buildEntityColumnDef()
            const Cell = () =>
                (columnDef as any).cell({
                    getValue: () => entity,
                    row: { original: {} },
                })

            render(<Cell />)

            expect(screen.getByText(displayName)).toBeInTheDocument()
        },
    )
})

describe('buildMetricColumnDefs', () => {
    it('returns one column def per ORDER_MANAGEMENT_COLUMNS entry', () => {
        const columns = buildMetricColumnDefs(defaultLoadingStates)

        expect(columns).toHaveLength(ORDER_MANAGEMENT_COLUMNS.length)
    })

    it('returns columns with the correct accessorKeys in order', () => {
        const columns = buildMetricColumnDefs(defaultLoadingStates)
        const accessorKeys = columns.map((col) => (col as any).accessorKey)

        expect(accessorKeys).toEqual([
            'automationRate',
            'automatedInteractions',
            'handoverInteractions',
            'costSaved',
            'timeSaved',
        ])
    })

    it('returns columns with enableHiding true', () => {
        const columns = buildMetricColumnDefs(defaultLoadingStates)

        columns.forEach((col) => {
            expect(col.enableHiding).toBe(true)
        })
    })
})
