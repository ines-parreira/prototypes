import type { Meta, StoryObj } from '@storybook/react'

import OnboardingDevPreview from 'pages/aiAgent/Onboarding_V2/components/OnboardingDevPreview/OnboardingDevPreview'

const storyConfig: Meta<typeof OnboardingDevPreview> = {
    title: 'AI Agent/Onboarding_V2/OnboardingDevPreview',
    component: OnboardingDevPreview,
}

type Story = StoryObj<typeof OnboardingDevPreview>

/** Default onboarding */
export const Primary: Story = {}

export default storyConfig
