import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { IntentCard } from 'domains/reporting/pages/common/components/IntentCard'

const meta: Meta<typeof IntentCard> = {
    title: 'Stats/IntentCard',
    component: IntentCard,
}

export default meta
type Story = StoryObj<typeof IntentCard>

export const Default: Story = {
    args: {
        intent: 'Return::Request::Connection stability issues are causing a lot of frustration for return',
        ticketCount: 220,
        prevTicketCount: 165,
        totalTicketCount: 8_857,
        onViewTickets: () => null,
    },
}

export const Loading: Story = {
    args: { isLoading: true },
}
