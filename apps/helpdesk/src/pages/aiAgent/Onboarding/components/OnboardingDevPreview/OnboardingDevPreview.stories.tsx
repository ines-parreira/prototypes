import { Meta, StoryObj } from '@storybook/react'

import OnboardingDevPreview from 'pages/aiAgent/Onboarding/components/OnboardingDevPreview/OnboardingDevPreview'

const storyConfig: Meta<typeof OnboardingDevPreview> = {
    title: 'AI Agent/Onboarding/OnboardingDevPreview',
    component: OnboardingDevPreview,
}

type Story = StoryObj<typeof OnboardingDevPreview>

/** Default onboarding */
export const Primary: Story = {}

export default storyConfig
