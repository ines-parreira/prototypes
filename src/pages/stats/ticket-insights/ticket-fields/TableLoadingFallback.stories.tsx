import type { Meta, StoryObj } from '@storybook/react'

import { TableLoadingFallback } from 'pages/stats/ticket-insights/ticket-fields/TableLoadingFallback'

const meta: Meta<typeof TableLoadingFallback> = {
    title: 'Stats/TicketInsights/TableLoadingFallback',
    component: TableLoadingFallback,
    parameters: {
        layout: 'centered',
    },
}

export default meta
type Story = StoryObj<typeof TableLoadingFallback>

export const Default: Story = {
    args: {},
}
