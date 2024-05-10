import React from 'react'
import {Meta, StoryObj} from '@storybook/react'
import TicketEvent, {TicketEventType} from './TicketEvent'

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

export const TicketClosed: Story = {
    render: (args) => <TicketEvent {...args} />,
    args: {
        type: TicketEventType.Closed,
    },
}
