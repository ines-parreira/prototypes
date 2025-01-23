import type {Meta, StoryObj} from '@storybook/react'

import TopLocationItem from './TopLocationItem'

const storyConfig: Meta<typeof TopLocationItem> = {
    title: 'AI Agent/Onboarding/TopLocationsCard/TopLocationItem',
    component: TopLocationItem,
}

type Story = StoryObj<typeof TopLocationItem>

export const Default: Story = {
    args: {
        location: {
            id: '1',
            title: 'New York',
            percentage: 100,
        },
    },
}

export const PercentageZero: Story = {
    args: {
        location: {
            id: '1',
            title: 'New York',
            percentage: 0,
        },
    },
}

export default storyConfig
