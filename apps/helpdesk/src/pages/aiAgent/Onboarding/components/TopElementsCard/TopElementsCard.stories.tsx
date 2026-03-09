import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import TopElementsCard from './TopElementsCard'

const storyConfig: Meta<typeof TopElementsCard> = {
    title: 'AI Agent/Onboarding/TopElementsCard/TopElementsCard',
    component: TopElementsCard,
}

type Story = StoryObj<typeof TopElementsCard>

export const Default: Story = {
    args: {
        title: 'Top Elements',
        topElements: [
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
