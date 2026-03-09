import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { TicketOutcome } from 'models/aiAgentPlayground/types'

import TicketEvent from './TicketEvent'

const meta: Meta<typeof TicketEvent> = {
    title: 'AI Agent/Playground/TicketEvent',
    component: TicketEvent,
    argTypes: {
        type: {
            description: 'The type of ticket event',
            control: {
                type: 'select',
            },
            options: ['Closed'],
        },
    },
}

export default meta

type Story = StoryObj<typeof TicketEvent>

export const TicketSnoozed: Story = {
    render: (args) => <TicketEvent {...args} />,
    args: {
        type: TicketOutcome.WAIT,
    },
}

export const TicketHandedOver: Story = {
    render: (args) => <TicketEvent {...args} />,
    args: {
        type: TicketOutcome.HANDOVER,
    },
}

export const TicketClosed: Story = {
    render: (args) => <TicketEvent {...args} />,
    args: {
        type: TicketOutcome.CLOSE,
    },
}
