import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import MetricCard from './MetricCard'
import TrendBadge from './TrendBadge'
import PerformanceTip from './PerformanceTip'

const storyConfig: Meta = {
    title: 'Stats/MetricCard',
    component: MetricCard,
}

const Template: Story<ComponentProps<typeof MetricCard>> = (props) => (
    <MetricCard {...props} />
)

const defaultProps: ComponentProps<typeof MetricCard> = {
    className: '',
    children: 'Value',
    hint: {title: "I'm a hint"},
    title: 'First response time',
    tip: (
        <PerformanceTip avgMerchant={4.62} topTen={4.99}>
            Tooltip content
        </PerformanceTip>
    ),
    trendBadge: <TrendBadge value={7} prevValue={2} />,
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
