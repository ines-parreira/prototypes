import React from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import TrialFinishSetupModal from './TrialFinishSetupModal'

const meta: Meta<typeof TrialFinishSetupModal> = {
    title: 'Overlays/TrialFinishSetupModal',
    component: TrialFinishSetupModal,
    parameters: {
        docs: {
            description: {
                component:
                    'A modal component for finishing setup steps for AI Shopping Assistant',
            },
        },
    },
    argTypes: {
        title: {
            control: { type: 'text' },
            description: 'The title of the modal',
        },
    },
}

export default meta
type Story = StoryObj<typeof TrialFinishSetupModal>

export const Default: Story = {
    args: {
        title: 'Ready. Set. Grow. Your 14-days trial starts now.',
        subtitle: "Let's unlock its full potential.",
        content:
            'Just two simple steps to increase conversions and make the most of your trial.',
        isOpen: true,
        onClose: () => {},
        primaryAction: {
            label: 'Finish setup',
            onClick: () => {},
        },
        isLoading: false,
    },
}
