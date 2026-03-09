import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import TopElementsItem from './TopElementItem'

const storyConfig: Meta<typeof TopElementsItem> = {
    title: 'AI Agent/Onboarding/TopElementsCard/TopElementsItem',
    component: TopElementsItem,
}

type Story = StoryObj<typeof TopElementsItem>

export const Default: Story = {
    args: {
        topElement: {
            id: '1',
            title: 'New York',
            percentage: 100,
        },
    },
}

export const PercentageZero: Story = {
    args: {
        topElement: {
            id: '1',
            title: 'New York',
            percentage: 0,
        },
    },
}

export default storyConfig
