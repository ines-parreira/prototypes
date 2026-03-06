import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'

import AccordionRadioFieldSet from './AccordionRadioFieldSet'

const meta: Meta<typeof AccordionRadioFieldSet> = {
    title: 'Common/Forms/AccordionRadioFieldSet',
    component: AccordionRadioFieldSet,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        value: {
            control: 'text',
            description: 'The currently selected value',
        },
        isDisabled: {
            control: 'boolean',
            description: 'Whether the entire fieldset is disabled',
        },
        options: {
            control: 'object',
            description: 'Array of radio options',
        },
        defaultExpandedItem: {
            control: 'text',
            description:
                'The value of the item that should be expanded by default',
        },
    },
}

export default meta

type Story = StoryObj<typeof AccordionRadioFieldSet>

export const Default: Story = {
    args: {
        value: null,
        onChange: fn(),
        options: [
            {
                label: 'Standard routing',
                value: 'standard',
                caption: 'Route calls to available agents',
            },
            {
                label: 'Priority routing',
                value: 'priority',
                caption: 'Route VIP customers first',
            },
            {
                label: 'Time-based routing',
                value: 'time-based',
                caption: 'Route based on business hours',
            },
        ],
    },
}

export const WithBody: Story = {
    args: {
        value: null,
        onChange: fn(),
        options: [
            {
                label: 'Standard routing',
                value: 'standard',
                caption: 'Route calls to available agents',
                body: (
                    <div style={{ padding: '16px' }}>
                        <p>
                            Calls are distributed evenly among all available
                            agents.
                        </p>
                    </div>
                ),
            },
            {
                label: 'Priority routing',
                value: 'priority',
                caption: 'Route VIP customers first',
                body: (
                    <div style={{ padding: '16px' }}>
                        <p>
                            VIP customers are prioritized and routed to senior
                            agents first.
                        </p>
                    </div>
                ),
            },
            {
                label: 'Time-based routing',
                value: 'time-based',
                caption: 'Route based on business hours',
                body: (
                    <div style={{ padding: '16px' }}>
                        <p>
                            Routing rules change based on the time of day and
                            day of week.
                        </p>
                    </div>
                ),
            },
        ],
    },
}

export const WithDefaultExpanded: Story = {
    args: {
        value: null,
        onChange: fn(),
        defaultExpandedItem: 'standard',
        options: [
            {
                label: 'Standard routing',
                value: 'standard',
                caption: 'Route calls to available agents',
                body: (
                    <div style={{ padding: '16px' }}>
                        <p>This option is expanded by default</p>
                    </div>
                ),
            },
            {
                label: 'Priority routing',
                value: 'priority',
                caption: 'Route VIP customers first',
                body: (
                    <div style={{ padding: '16px' }}>
                        <p>This option can be expanded</p>
                    </div>
                ),
            },
        ],
    },
}

export const WithDisabledOptions: Story = {
    args: {
        value: null,
        onChange: fn(),
        options: [
            {
                label: 'Standard routing',
                value: 'standard',
                caption: 'Available option',
            },
            {
                label: 'Priority routing',
                value: 'priority',
                caption: 'Requires premium plan',
                disabled: true,
            },
            {
                label: 'Time-based routing',
                value: 'time-based',
                caption: 'Available option',
            },
        ],
    },
}

export const Disabled: Story = {
    args: {
        value: 'standard',
        onChange: fn(),
        isDisabled: true,
        options: [
            {
                label: 'Standard routing',
                value: 'standard',
                caption: 'Route calls to available agents',
            },
            {
                label: 'Priority routing',
                value: 'priority',
                caption: 'Route VIP customers first',
            },
        ],
    },
}

export const WithPreselectedValue: Story = {
    args: {
        value: 'priority',
        onChange: fn(),
        options: [
            {
                label: 'Standard routing',
                value: 'standard',
                caption: 'Route calls to available agents',
            },
            {
                label: 'Priority routing',
                value: 'priority',
                caption: 'Route VIP customers first',
            },
            {
                label: 'Time-based routing',
                value: 'time-based',
                caption: 'Route based on business hours',
            },
        ],
    },
}

export const WithComplexBody: Story = {
    args: {
        value: null,
        onChange: fn(),
        options: [
            {
                label: 'Custom routing',
                value: 'custom',
                caption: 'Configure advanced routing rules',
                body: (
                    <div style={{ padding: '16px' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: '4px',
                                    fontWeight: 500,
                                }}
                            >
                                Agent group
                            </label>
                            <select
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '4px',
                                }}
                            >
                                <option>Support Team</option>
                                <option>Sales Team</option>
                            </select>
                        </div>
                        <div>
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <input type="checkbox" />
                                Enable round-robin distribution
                            </label>
                        </div>
                    </div>
                ),
            },
        ],
    },
}
