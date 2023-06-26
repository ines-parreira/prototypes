import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import MetricCard from './MetricCard'
import MetricTip from './MetricTip'
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
    tip: <MetricTip title="Tooltip title">Tooltip content</MetricTip>,
    trendBadge: <TrendBadge value={7} prevValue={2} />,
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
