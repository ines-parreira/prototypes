import React from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import NewToggleField from './NewToggleField'

const meta: Meta<typeof NewToggleField> = {
    title: 'Data Entry/NewToggleField',
    component: NewToggleField,
    argTypes: {
        value: {
            control: 'boolean',
            description: 'The current value of the toggle',
        },
        label: {
            control: 'text',
            description: 'Optional label to display next to the toggle',
        },
        onChange: {
            description: 'Callback function called when toggle state changes',
        },
        isDisabled: {
            control: 'boolean',
            description: 'Whether the toggle is disabled',
        },
        color: {
            control: 'color',
            description: 'Custom color for the toggle when checked',
        },
        className: {
            control: 'text',
            description: 'Additional CSS class names',
        },
        stopPropagation: {
            control: 'boolean',
            description: 'Whether to stop event propagation on click',
        },
        name: {
            control: 'text',
            description: 'Name attribute for the hidden checkbox input',
        },
    },
}

export default meta

type Story = StoryObj<typeof NewToggleField>

export const Default: Story = {
    render: (args) => <NewToggleField {...args} />,
    args: {
        value: false,
        label: 'Default Toggle',
    },
}

export const WithoutLabel: Story = {
    render: (args) => <NewToggleField {...args} />,
    args: {
        value: false,
    },
}

export const Checked: Story = {
    render: (args) => <NewToggleField {...args} />,
    args: {
        value: true,
        label: 'Checked Toggle',
    },
}

export const Disabled: Story = {
    render: (args) => <NewToggleField {...args} />,
    args: {
        value: false,
        label: 'Disabled Toggle',
        isDisabled: true,
    },
}

export const DisabledChecked: Story = {
    render: (args) => <NewToggleField {...args} />,
    args: {
        value: true,
        label: 'Disabled Checked Toggle',
        isDisabled: true,
    },
}

export const CustomColor: Story = {
    render: (args) => <NewToggleField {...args} />,
    args: {
        value: true,
        label: 'Custom Color Toggle',
        color: '#FF6B6B',
    },
}

export const WithCustomReactNodeLabel: Story = {
    render: (args) => <NewToggleField {...args} />,
    args: {
        value: false,
        label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>Enable notifications</span>
                <span
                    style={{
                        fontSize: '12px',
                        color: '#666',
                        backgroundColor: '#f0f0f0',
                        padding: '2px 6px',
                        borderRadius: '4px',
                    }}
                >
                    BETA
                </span>
            </div>
        ),
    },
}
