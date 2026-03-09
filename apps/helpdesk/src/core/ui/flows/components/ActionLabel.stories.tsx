import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { ActionLabel } from './ActionLabel'

const meta: Meta<typeof ActionLabel> = {
    title: 'Common/Flows/ActionLabel',
    component: ActionLabel,
    argTypes: {
        label: {
            control: 'text',
            description: 'The label of the action',
        },
        icon: {
            control: 'object',
            description: 'The icon to display in the action label',
        },
    },
}

export default meta

type Story = StoryObj<typeof ActionLabel>

export const Default: Story = {
    render: (args) => <ActionLabel {...args} />,
    args: {
        label: 'Action Label',
    },
}

export const WithIcon: Story = {
    render: (args) => <ActionLabel {...args} />,
    args: {
        label: 'Sent Email',
        icon: <i className="material-icons-outlined">email</i>,
    },
}

export const LongLabel: Story = {
    render: (args) => <ActionLabel {...args} />,
    args: {
        label: 'This is a very long action label that might wrap',
        icon: <i className="material-icons">settings</i>,
    },
}
