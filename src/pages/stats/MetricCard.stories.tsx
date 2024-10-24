import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'

import MetricCard from './MetricCard'
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
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
