import type { ComponentProps } from 'react'
import React from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { LegacyButton as Button } from '@gorgias/axiom'

import ProgressTracker from 'pages/common/components/ProgressTracker/ProgressTracker'

const storyConfig: Meta<typeof ProgressTracker> = {
    title: 'General/ProgressTracker/ProgressTracker',
    component: ProgressTracker,
    argTypes: {
        stepLabel: {
            control: {
                type: 'text',
            },
        },
        step: {
            control: {
                type: 'number',
            },
        },
        totalSteps: {
            control: {
                type: 'number',
            },
        },
        stepTrackerColor: {
            control: {
                type: 'color',
            },
        },
    },
}

type Story = StoryObj<typeof ProgressTracker>

const templateParameters = {
    controls: {
        include: ['stepLabel', 'step', 'totalSteps', 'stepTrackerColor'],
    },
}

const defaultProps: ComponentProps<typeof ProgressTracker> = {
    stepLabel: 'Step',
    step: 3,
    totalSteps: 8,
    stepTrackerColor: '#C34CED',
    cta: (
        <>
            <Button fillStyle="fill" intent="secondary" size="medium">
                Back
            </Button>
            <Button fillStyle="fill" intent="primary" size="medium">
                Next
            </Button>
        </>
    ),
}

/** Default progress tracker */
export const DefaultProgressTracker: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
    },
}

export default storyConfig
