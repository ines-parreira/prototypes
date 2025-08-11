import { Meta, StoryObj } from '@storybook/react'

import { StepCardErrorIcon } from './StepCardErrorIcon'

const meta: Meta<typeof StepCardErrorIcon> = {
    title: 'Common/Flows/StepCardErrorIcon',
    component: StepCardErrorIcon,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        errorTitle: {
            control: 'text',
            description: 'Optional title for the error tooltip',
        },
        errors: {
            control: 'object',
            description: 'Array of error messages to display in the tooltip',
        },
    },
}

export default meta

type Story = StoryObj<typeof StepCardErrorIcon>

export const SingleError: Story = {
    args: {
        errors: ['Missing required configuration.'],
    },
}

export const MultipleErrors: Story = {
    args: {
        errors: [
            'Missing phone number field',
            'Invalid action type selected',
            'Destination step not configured',
        ],
    },
}

export const WithErrorTitle: Story = {
    args: {
        errorTitle: 'Configuration Errors',
        errors: [
            'Missing phone number field',
            'Invalid action type selected',
            'Destination step not configured',
        ],
    },
}
