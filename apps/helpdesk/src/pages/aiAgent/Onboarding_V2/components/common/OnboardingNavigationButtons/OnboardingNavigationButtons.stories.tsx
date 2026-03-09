import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { OnboardingNavigationButtons } from './OnboardingNavigationButtons'

const storyConfig: Meta<typeof OnboardingNavigationButtons> = {
    title: 'AI Agent/Onboarding_V2/OnboardingNavigationButtons',
    component: OnboardingNavigationButtons,
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

type Story = StoryObj<typeof OnboardingNavigationButtons>

const templateParameters = {
    controls: {
        include: ['step', 'totalSteps'],
    },
}

const defaultProps: ComponentProps<typeof OnboardingNavigationButtons> = {
    step: 2,
    totalSteps: 4,
    isLoading: false,
    // eslint-disable-next-line no-console
    onBackClick: () => console.log('Back clicked'),
    // eslint-disable-next-line no-console
    onNextClick: () => console.log('Next clicked'),
}

/** Default onboarding navigation buttons with Back and Next buttons */
export const DefaultNavigationButtons: Story = {
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
    },
}

/** First step - only Next button shown */
export const FirstStep: Story = {
    args: {
        ...defaultProps,
        step: 1,
    },
    parameters: {
        ...templateParameters,
    },
}

/** Final step - Back and Finish buttons shown */
export const FinalStep: Story = {
    args: {
        ...defaultProps,
        step: 4,
    },
    parameters: {
        ...templateParameters,
    },
}

/** Close button shown when onCloseClick is provided */
export const WithCloseButton: Story = {
    args: {
        ...defaultProps,
        // eslint-disable-next-line no-console
        onCloseClick: () => console.log('Close clicked'),
    },
    parameters: {
        ...templateParameters,
    },
}

export default storyConfig
