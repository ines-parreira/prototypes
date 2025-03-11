import React from 'react'

import { action } from '@storybook/addon-actions'
import { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import { PreviewModal } from './PreviewModal'

const meta: Meta<typeof PreviewModal> = {
    title: 'AI Agent/Activation/PreviewModal',
    component: PreviewModal,
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

type Story = StoryObj<typeof PreviewModal>

export const PreviewModalDefault: Story = {
    render: (args) => <PreviewModal {...args} />,
    args: {
        currentPriceLabel: '$932/month',
        earlyAccessPriceLabel: '$800/month',
        earlyAccessPriceReductionLabel: 'Save $132/month for 12 months',
        isLoading: false,
        isOpen: true,
        onClose: action('onClose'),
        onStayClick: action('onStayClick'),
        onUpgradeClick: action('onUpgradeClick'),
    },
}
