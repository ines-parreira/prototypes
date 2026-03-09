import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { StepCardTitleIcon } from './StepCardTitleIcon'

const meta: Meta<typeof StepCardTitleIcon> = {
    title: 'Common/Flows/StepCardTitleIcon',
    component: StepCardTitleIcon,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        messageTitle: {
            control: 'text',
            description: 'Optional title for the tooltip',
        },
        messages: {
            control: 'object',
            description: 'Array of messages to display in the tooltip',
        },
        variant: {
            control: 'radio',
            options: ['error', 'warning'],
            description:
                'Icon variant - error shows octagon-warning icon, warning shows triangle-warning icon',
        },
    },
}

export default meta

type Story = StoryObj<typeof StepCardTitleIcon>

export const SingleError: Story = {
    args: {
        messages: ['Missing required configuration.'],
    },
}

export const MultipleErrors: Story = {
    args: {
        messages: [
            'Missing phone number field',
            'Invalid action type selected',
            'Destination step not configured',
        ],
    },
}

export const WithErrorTitle: Story = {
    args: {
        messageTitle: 'Configuration Errors',
        messages: [
            'Missing phone number field',
            'Invalid action type selected',
            'Destination step not configured',
        ],
    },
}

export const WarningVariant: Story = {
    args: {
        variant: 'warning',
        messages: ['This configuration may cause unexpected behavior.'],
    },
}

export const MultipleWarnings: Story = {
    args: {
        variant: 'warning',
        messageTitle: 'Configuration Warnings',
        messages: [
            'Queue may be unavailable outside business hours',
            'No fallback option configured',
            'Long wait times expected',
        ],
    },
}

export const ErrorVariant: Story = {
    args: {
        variant: 'error',
        messages: ['Critical error: Missing required field.'],
    },
}
