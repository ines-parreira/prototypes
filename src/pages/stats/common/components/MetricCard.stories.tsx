import type { ComponentProps } from 'react'

import { Meta, StoryObj } from '@storybook/react'

import MetricCard from './MetricCard'
import PerformanceTip from './PerformanceTip'

const storyConfig: Meta = {
    title: 'Stats/MetricCard',
    component: MetricCard,
}

type Story = StoryObj<typeof MetricCard>

const Template: Story = {
    render: (props) => <MetricCard {...props} />,
}

const defaultProps: ComponentProps<typeof MetricCard> = {
    className: '',
    children: 'Value',
    hint: { title: "I'm a hint" },
    title: 'First response time',
    tip: (
        <PerformanceTip avgMerchant={4.62} topTen={4.99}>
            Tooltip content
        </PerformanceTip>
    ),
}

export const Default = {
    ...Template,
    args: defaultProps,
}

export default storyConfig
