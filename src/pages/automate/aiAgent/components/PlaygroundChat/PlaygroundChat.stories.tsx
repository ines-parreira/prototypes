import React from 'react'
import {Meta, StoryObj} from '@storybook/react'
import {PlaygroundChat} from './PlaygroundChat'

const meta: Meta<typeof PlaygroundChat> = {
    title: 'AI Agent/Playground/Chat',
    component: PlaygroundChat,
}

export default meta

type Story = StoryObj<typeof PlaygroundChat>

export const Default: Story = {
    render: () => <PlaygroundChat />,
}
