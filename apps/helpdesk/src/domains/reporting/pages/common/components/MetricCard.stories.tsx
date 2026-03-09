import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import PerformanceTip from 'domains/reporting/pages/common/components/PerformanceTip'

const storyConfig: Meta = {
    title: 'Stats/MetricCard',
    component: MetricCard,
    parameters: { chromatic: { disableSnapshot: false } },
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
