import {Meta, StoryObj} from '@storybook/react'

import React from 'react'

import modalImage from 'assets/img/ai-agent/ai_agent_onboarding_thankyou.png'

import ThankYouModal from './ThankYouModal'

const storyConfig: Meta<typeof ThankYouModal> = {
    title: 'AI Agent/Onboarding/ThankYouModal',
    component: ThankYouModal,
}

type Story = StoryObj<typeof ThankYouModal>

export const Default: Story = {
    args: {
        image: <img src={modalImage} alt="Thank you" />,
        title: 'Your account is ready!',
        description: 'Lorem ipsum, lorem ipsum, lorem ipsum.',
        actionLabel: 'Go live with AI agent',
        onClick: () => {},
        closeLabel: 'Close',
        onClose: () => {},
    },
}

export default storyConfig
