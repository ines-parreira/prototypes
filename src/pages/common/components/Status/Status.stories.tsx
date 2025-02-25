import React, { ComponentProps } from 'react'

import { Meta, StoryObj } from '@storybook/react'

import Status, { StatusType } from './Status'

const meta: Meta<typeof Status> = {
    title: 'Common/Status',
    component: Status,
    argTypes: {
        type: {
            description: 'The color of the status dot',
            control: {
                type: StatusType,
            },
        },
        children: {
            description: 'The content of the status component',
            control: {
                type: 'text',
            },
        },
    },
}

export default meta

type Story = StoryObj<ComponentProps<typeof Status>>

export const Success: Story = {
    render: (args) => <Status {...args} />,
    args: {
        type: StatusType.Success,
        children: 'Success',
    },
}

export const Error: Story = {
    render: (args) => <Status {...args} />,
    args: {
        type: StatusType.Error,
        children: 'Error',
    },
}

export const Warning: Story = {
    render: (args) => <Status {...args} />,
    args: {
        type: StatusType.Warning,
        children: 'Warning',
    },
}

export const Info: Story = {
    render: (args) => <Status {...args} />,
    args: {
        type: StatusType.Info,
        children: 'Info',
    },
}
