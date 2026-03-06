import type { Meta, StoryObj } from '@storybook/react'
import { action } from 'storybook/actions'

import modalImage from 'assets/img/ai-agent/ai_agent_onboarding_thankyou.png'

import ThankYouModal from './ThankYouModal'

const storyConfig: Meta<typeof ThankYouModal> = {
    title: 'AI Agent/Onboarding/ThankYouModal',
    component: ThankYouModal,
}

type Story = StoryObj<typeof ThankYouModal>

export const Default: Story = {
    args: {
        isOpen: true,
        image: <img src={modalImage} alt="Thank you" />,
        title: 'Your account is ready!',
        description: 'Lorem ipsum, lorem ipsum, lorem ipsum.',
        actionLabel: 'Go live with AI agent',
        closeLabel: 'Close',
        onClick: action('onClick'),
        onClose: action('onClose'),
    },
}

export default storyConfig
