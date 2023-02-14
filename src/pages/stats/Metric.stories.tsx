import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import Metric from './Metric'
import MetricTooltip from './MetricTooltip'
import TrendBadge from './TrendBadge'

const storyConfig: Meta = {
    title: 'Stats/Metric',
    component: Metric,
}

const Template: Story<ComponentProps<typeof Metric>> = (props) => (
    <Metric {...props} />
)

const defaultProps: ComponentProps<typeof Metric> = {
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
