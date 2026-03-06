import type { Meta, StoryObj } from '@storybook/react'
import { action } from 'storybook/actions'

import { StepCard } from './StepCard'
import { StepCardActionMenu } from './StepCardActionMenu'
import { StepCardActionMenuItem } from './StepCardActionMenuItem'

const meta: Meta<typeof StepCard> = {
    title: 'Common/Flows/StepCard',
    component: StepCard,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        title: {
            control: 'text',
            description: 'The title of the step card',
        },
        description: {
            control: 'text',
            description: 'The description of the step card',
        },
        isSelected: {
            control: 'boolean',
            description: 'Whether the card is selected',
        },
        errors: {
            control: 'object',
            description:
                'Array of error messages (takes priority over warnings)',
        },
        warnings: {
            control: 'object',
            description:
                'Array of warning messages (shown only when no errors)',
        },
        children: {
            description: 'Children components (e.g., StepCardActionMenu)',
        },
    },
}

export default meta

type Story = StoryObj<typeof StepCard>

export const Default: Story = {
    args: {
        title: 'Send SMS',
        description: 'Send a text message to the customer',
    },
}

export const WithIcon: Story = {
    args: {
        title: 'Email Customer',
        description: 'Send an email notification',
        icon: <i className="material-icons">email</i>,
    },
}

export const Selected: Story = {
    args: {
        title: 'Call Customer',
        description: 'Initiate a phone call',
        isSelected: true,
        icon: <i className="material-icons">phone</i>,
    },
}

export const WithErrors: Story = {
    args: {
        title: 'Transfer Call',
        description: 'Transfer to another agent',
        errors: [
            'No destination configured',
            'Agent group not selected',
            'Transfer rules not defined',
        ],
    },
}

export const SelectedWithErrors: Story = {
    args: {
        title: 'Transfer Call',
        description: 'Transfer to another agent',
        isSelected: true,
        errors: [
            'No destination configured',
            'Agent group not selected',
            'Transfer rules not defined',
        ],
    },
}

export const WithWarnings: Story = {
    args: {
        title: 'Route to Queue',
        description: 'Direct call to customer support queue',
        warnings: [
            'Queue may be unavailable outside business hours',
            'High wait time expected during peak hours',
        ],
    },
}

export const SelectedWithWarnings: Story = {
    args: {
        title: 'Route to Queue',
        description: 'Direct call to customer support queue',
        isSelected: true,
        warnings: [
            'Queue may be unavailable outside business hours',
            'High wait time expected during peak hours',
        ],
    },
}

export const WithErrorsAndWarnings: Story = {
    args: {
        title: 'Complex Step',
        description: 'Step with both errors and warnings',
        errors: ['Critical configuration missing'],
        warnings: ['Performance may be degraded', 'Consider using alternative'],
    },
}

export const WithActionMenu: Story = {
    render: (args) => (
        <StepCard {...args}>
            <StepCardActionMenu>
                <StepCardActionMenuItem
                    label="Edit"
                    icon={<i className="material-icons">edit</i>}
                    onClick={() => action('Edit clicked')()}
                />
                <StepCardActionMenuItem
                    label="Delete"
                    icon={<i className="material-icons-outlined">delete</i>}
                    onClick={() => action('Delete clicked')()}
                />
            </StepCardActionMenu>
        </StepCard>
    ),
    args: {
        title: 'Quick Actions',
        description: 'Card with action menu',
    },
}

export const FullFeatured: Story = {
    render: (args) => (
        <StepCard {...args}>
            <StepCardActionMenu>
                <StepCardActionMenuItem
                    icon={<i className="material-icons">settings</i>}
                    label="Settings"
                    onClick={() => action('Settings clicked')()}
                />
                <StepCardActionMenuItem
                    icon={<i className="material-icons">description</i>}
                    label="View Logs"
                    onClick={() => action('View Logs clicked')()}
                />
                <StepCardActionMenuItem
                    icon={<i className="material-icons">block</i>}
                    label="Disable"
                    onClick={() => action('Disable clicked')()}
                />
            </StepCardActionMenu>
        </StepCard>
    ),
    args: {
        title: 'Process Payment',
        description: 'Process customer payment transaction',
        icon: <i className="material-icons">payment</i>,
        isSelected: true,
        errors: ['Payment gateway not configured'],
    },
}

export const LongDescriptions: Story = {
    render: (args) => <StepCard {...args} />,
    args: {
        title: 'Advanced Routing Logic for Customer Requests',
        description:
            'This is a very long description that will be truncated. It includes detailed information about the routing logic and how it processes incoming requests based on various parameters and conditions.',
    },
}

export const CustomTitleAndDescription: Story = {
    args: {
        title: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Workflow Step</span>
                <span
                    style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                    }}
                >
                    v2.0
                </span>
            </div>
        ),
        description: (
            <div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}
                >
                    <i
                        className="material-icons"
                        style={{ fontSize: '14px', color: '#6b7280' }}
                    >
                        schedule
                    </i>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                        Runs every 5 minutes
                    </span>
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '2px',
                    }}
                >
                    <i
                        className="material-icons"
                        style={{ fontSize: '14px', color: '#6b7280' }}
                    >
                        check_circle
                    </i>
                    <span style={{ fontSize: '13px', color: '#10b981' }}>
                        Last run: Success
                    </span>
                </div>
            </div>
        ),
        icon: <i className="material-icons">settings_suggest</i>,
    },
}
