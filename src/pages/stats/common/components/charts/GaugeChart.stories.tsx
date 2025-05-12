import type { ComponentProps } from 'react'

import { Meta, StoryObj } from '@storybook/react'

import {
    ChatWorkload,
    EmailWorkload,
    InstagramWorkload,
    OthersWorkload,
    PhoneWorkload,
} from 'fixtures/chart'

import GaugeChart from './GaugeChart'

const storyConfig: Meta = {
    title: 'Stats/GaugeChart',
    component: GaugeChart,
}

type Story = StoryObj<typeof GaugeChart>

const Template: Story = {
    render: (props) => <GaugeChart {...props} />,
}

const defaultProps: ComponentProps<typeof GaugeChart> = {
    data: [
        ChatWorkload,
        EmailWorkload,
        InstagramWorkload,
        PhoneWorkload,
        OthersWorkload,
    ],
}

export const Default = {
    ...Template,
    args: defaultProps,
}

export default storyConfig
