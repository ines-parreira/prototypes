import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import TrackerCircle from './TrackerCircle'

const storyConfig: Meta<typeof TrackerCircle> = {
    title: 'General/ProgressTracker/TrackerCircle',
    component: TrackerCircle,
    argTypes: {
        color: {
            control: {
                type: 'color',
            },
        },
        percentage: {
            control: {
                type: 'number',
            },
        },
        radius: {
            control: {
                type: 'number',
            },
        },
    },
}

type Story = StoryObj<typeof TrackerCircle>

export const Default: Story = {
    args: {
        color: '#C34CED',
        percentage: 50,
    },
}

export const WithLabel: Story = {
    args: {
        color: '#FD9B5A',
        percentage: 50,
        radius: 54,
        strokeWidth: 9,
        label: '50',
    },
}

export default storyConfig
