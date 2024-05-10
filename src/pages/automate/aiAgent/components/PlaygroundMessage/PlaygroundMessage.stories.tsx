import React from 'react'
import {Meta, StoryObj} from '@storybook/react'
import PlaygroundMessage, {MessageType} from './PlaygroundMessage'

const meta: Meta<typeof PlaygroundMessage> = {
    title: 'AI Agent/Playground/Message',
    component: PlaygroundMessage,
    argTypes: {
        sender: {
            control: {
                type: 'text',
            },
        },
        message: {
            control: {
                type: 'text',
            },
        },
        type: {
            control: {
                type: 'string',
            },
        },
    },
}

export default meta

type Story = StoryObj<typeof PlaygroundMessage>

export const UserMessage: Story = {
    render: (args) => <PlaygroundMessage {...args} />,
    args: {
        sender: 'John Doe',
        message: 'Where is my order?',
        type: MessageType.MESSAGE,
    },
}

export const AIAgentMessageLoading: Story = {
    render: (args) => <PlaygroundMessage {...args} />,
    args: {
        sender: 'AI Agent',
        aiAgentProcessingStatus: 'Processing',
        type: MessageType.MESSAGE,
    },
}

export const AIAgentInternalNoteMessage: Story = {
    render: (args) => <PlaygroundMessage {...args} />,
    args: {
        sender: 'AI Agent',
        message: 'Where is my order?',
        type: MessageType.INTERNAL_NOTE,
    },
}

export const AIAgentMessage: Story = {
    render: (args) => <PlaygroundMessage {...args} />,
    args: {
        sender: 'AI Agent',
        message: 'Where is my order?',
        type: MessageType.MESSAGE,
    },
}
