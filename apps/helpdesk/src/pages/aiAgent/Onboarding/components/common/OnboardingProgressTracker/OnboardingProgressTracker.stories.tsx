import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import OnboardingProgressTracker from './OnboardingProgressTracker'

const storyConfig: Meta<typeof OnboardingProgressTracker> = {
    title: 'AI Agent/Onboarding/OnboardingProgressTracker',
    component: OnboardingProgressTracker,
    argTypes: {
        step: {
            control: {
                type: 'number',
                min: 1,
            },
        },
        totalSteps: {
            control: {
                type: 'number',
                min: 1,
            },
        },
        onBackClick: { action: 'back clicked' },
        onNextClick: { action: 'next clicked' },
    },
}

type Story = StoryObj<typeof OnboardingProgressTracker>

const templateParameters = {
    controls: {
        include: ['step', 'totalSteps'],
    },
}

const defaultProps: ComponentProps<typeof OnboardingProgressTracker> = {
    step: 2,
    totalSteps: 4,
    isLoading: false,
    // eslint-disable-next-line no-console
    onBackClick: () => console.log('Back clicked'),
    // eslint-disable-next-line no-console
    onNextClick: () => console.log('Next clicked'),
}

/** Default onboarding progress tracker */
export const DefaultOnboardingTracker: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
    },
}

/** First step - no back button */
export const FirstStep: Story = {
    args: {
        ...defaultProps,
        step: 1,
    },
    parameters: {
        ...templateParameters,
    },
}

/** Final step - "Finish" button */
export const FinalStep: Story = {
    args: {
        ...defaultProps,
        step: 4,
    },
    parameters: {
        ...templateParameters,
    },
}

export default storyConfig
