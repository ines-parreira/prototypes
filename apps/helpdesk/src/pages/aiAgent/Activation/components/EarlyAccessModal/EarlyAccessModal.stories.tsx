import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import { action } from 'storybook/actions'

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
        isLoading: false,
        isOpen: true,
        onClose: action('onClose'),
        onUpgradeClick: action('onUpgradeClick'),
    },
}

export const EarlyAccessModalNonAdmin: Story = {
    render: (args) => <EarlyAccessModal {...args} />,
    args: {
        isLoading: false,
        isOpen: true,
        onClose: action('onClose'),
        onUpgradeClick: action('onUpgradeClick'),
        userIsAdmin: false,
    },
}
