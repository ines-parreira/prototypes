import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import MetricTitle from './MetricTitle'
import TrendBadge from './TrendBadge'

const storyConfig: Meta = {
    title: 'Stats/MetricTitle',
    component: MetricTitle,
}

const Template: Story<ComponentProps<typeof MetricTitle>> = (props) => (
    <MetricTitle {...props} />
)

const defaultProps: ComponentProps<typeof MetricTitle> = {
    className: '',
    children: 'Title',
    hint: "I'm a hint",
    trendBadge: <TrendBadge type="up">5%</TrendBadge>,
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
