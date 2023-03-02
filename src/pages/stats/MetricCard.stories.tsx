import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import MetricCard from './MetricCard'
import MetricTooltip from './MetricTooltip'
import TrendBadge from './TrendBadge'

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
    hint: "I'm a hint",
    title: 'First response time',
    tooltip: (
        <MetricTooltip title="Tooltip title">Tooltip content</MetricTooltip>
    ),
    trendBadge: <TrendBadge type="up">5%</TrendBadge>,
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
