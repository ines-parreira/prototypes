import { Meta, StoryObj } from '@storybook/react'

import { IntentCard } from 'pages/stats/common/components/IntentCard'

const meta: Meta<typeof IntentCard> = {
    title: 'Stats/IntentCard',
    component: IntentCard,
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        title: 'Return',
        description:
            'Connection stability issues are causing a lot of frustration for return',
        ticketCount: 220,
        prevTicketCount: 165,
        totalTicketCount: 8_857,
        onViewTickets: () => null,
    },
}
