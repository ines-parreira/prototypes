import type {Meta, StoryObj} from '@storybook/react'

import TopLocationsCard from './TopLocationsCard'

const storyConfig: Meta<typeof TopLocationsCard> = {
    title: 'AI Agent/Onboarding/TopLocationsCard/TopLocationsCard',
    component: TopLocationsCard,
}

type Story = StoryObj<typeof TopLocationsCard>

export const Default: Story = {
    args: {
        title: 'Top Locations',
        locations: [
            {
                id: '1',
                title: 'New York',
                percentage: 100,
            },
            {
                id: '2',
                title: 'Paris',
                percentage: 75,
            },
            {
                id: '3',
                title: 'Los Angeles',
                percentage: 40,
            },
            {
                id: '4',
                title: 'Tokyo',
                percentage: 5,
            },
        ],
    },
}

export default storyConfig
