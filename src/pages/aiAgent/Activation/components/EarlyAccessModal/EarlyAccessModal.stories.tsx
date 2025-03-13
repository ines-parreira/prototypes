import React from 'react'

import { action } from '@storybook/addon-actions'
import { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import { Cadence } from 'models/billing/types'

import { EarlyAccessModal } from './EarlyAccessModal'

const meta: Meta<typeof EarlyAccessModal> = {
    title: 'AI Agent/Activation/EarlyAccessModal',
    component: EarlyAccessModal,
    args: {},
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={['/']}>
                <Story />
            </MemoryRouter>
        ),
    ],
}

export default meta

type Story = StoryObj<typeof EarlyAccessModal>

export const EarlyAccessModalDefault: Story = {
    render: (args) => <EarlyAccessModal {...args} />,
    args: {
        plan: {
            amount: 93200,
            currency: 'USD',
            amount_after_discount: 80000,
            cadence: Cadence.Month,
            discount: 13200,
        } as any,
        isLoading: false,
        isOpen: true,
        onClose: action('onClose'),
        onStayClick: action('onStayClick'),
        onUpgradeClick: action('onUpgradeClick'),
    },
}
