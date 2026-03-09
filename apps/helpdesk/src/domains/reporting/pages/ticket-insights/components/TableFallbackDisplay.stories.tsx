import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { TableFallbackDisplay } from 'domains/reporting/pages/ticket-insights/components/TableFallbackDisplay'

const meta: Meta<typeof TableFallbackDisplay> = {
    title: 'Stats/TicketInsights/TableFallbackDisplay',
    component: TableFallbackDisplay,
    parameters: {
        layout: 'centered',
    },
}

export default meta
type Story = StoryObj<typeof TableFallbackDisplay>

export const DefaultLoading: Story = {
    args: {
        isLoading: true,
        noData: false,
        columnOrder: ['column1', 'column2'],
        columnConfig: {
            column1: {
                title: 'Column 1',
                tooltip: {
                    title: 'Column 1',
                },
                isSortable: true,
            },
            column2: {
                title: 'Column 2',
                tooltip: {
                    title: 'Column 2',
                },
                isSortable: true,
            },
        },
    },
}

export const DefaultNoData: Story = {
    args: {
        isLoading: false,
        noData: true,
        columnOrder: ['column1', 'column2'],
        columnConfig: {
            column1: {
                title: 'Column 1',
                tooltip: {
                    title: 'Column 1',
                },
                isSortable: true,
            },
            column2: {
                title: 'Column 2',
                tooltip: {
                    title: 'Column 2',
                },
                isSortable: true,
            },
        },
    },
}
