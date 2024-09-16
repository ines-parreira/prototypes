import React from 'react'
import {Meta, StoryObj} from '@storybook/react'
import {MessageType} from 'models/aiAgentPlayground/types'
import PlaygroundMessage, {AI_AGENT_SENDER} from './PlaygroundMessage'

const meta: Meta<typeof PlaygroundMessage> = {
    title: 'AI Agent/Playground/Message',
    component: PlaygroundMessage,
}

export default meta

type Story = StoryObj<typeof PlaygroundMessage>

export const AIAgentErrorMessage: Story = {
    render: (args) => <PlaygroundMessage {...args} />,
    args: {
        message: {
            sender: AI_AGENT_SENDER,
            content: (
                <div>
                    AI Agent encountered an error and didn’t send a response.
                </div>
            ),
            type: MessageType.ERROR,
            createdDatetime: new Date().toISOString(),
        },
    },
}

export const UserMessage: Story = {
    render: (args) => <PlaygroundMessage {...args} />,
    args: {
        message: {
            sender: 'John Doe',
            content: 'Where is my order?',
            type: MessageType.MESSAGE,
            createdDatetime: new Date().toISOString(),
        },
    },
}

export const AIAgentMessageLoading: Story = {
    render: (args) => <PlaygroundMessage {...args} />,
    args: {
        message: {
            sender: AI_AGENT_SENDER,
            type: MessageType.PLACEHOLDER,
            createdDatetime: new Date().toISOString(),
        },
    },
}

export const AIAgentInternalNoteMessage: Story = {
    render: (args) => <PlaygroundMessage {...args} />,
    args: {
        message: {
            sender: AI_AGENT_SENDER,
            content: 'Where is my order?',
            type: MessageType.INTERNAL_NOTE,
            createdDatetime: new Date().toISOString(),
        },
    },
}

export const AIAgentMessage: Story = {
    render: (args) => <PlaygroundMessage {...args} />,
    args: {
        message: {
            sender: AI_AGENT_SENDER,
            content: 'Where is my order?',
            type: MessageType.MESSAGE,
            createdDatetime: new Date().toISOString(),
        },
    },
}
