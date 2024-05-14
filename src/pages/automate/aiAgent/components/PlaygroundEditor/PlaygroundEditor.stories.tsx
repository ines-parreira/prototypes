import React from 'react'
import {Meta, StoryObj} from '@storybook/react'
import {PlaygroundEditor} from './PlaygroundEditor'

const meta: Meta<typeof PlaygroundEditor> = {
    title: 'AI Agent/Playground/Editor',
    component: PlaygroundEditor,
    argTypes: {
        onChange: {
            table: {
                disabled: true,
            },
        },
    },
}

export default meta

type Story = StoryObj<typeof PlaygroundEditor>

export const Default: Story = {
    render: (args) => <PlaygroundEditor {...args} />,
}
