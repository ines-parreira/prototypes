import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import GaugeChart from 'domains/reporting/pages/common/components/charts/GaugeChart'
import {
    ChatWorkload,
    EmailWorkload,
    InstagramWorkload,
    OthersWorkload,
    PhoneWorkload,
} from 'fixtures/chart'

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
