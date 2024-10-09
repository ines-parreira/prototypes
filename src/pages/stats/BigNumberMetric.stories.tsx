import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'
import TrendBadge from 'pages/stats//TrendBadge'

import BigNumberMetric from './BigNumberMetric'

const storyConfig: Meta = {
    title: 'Stats/BigNumberMetric',
    component: BigNumberMetric,
    parameters: {
        chromatic: {disableSnapshot: false},
    },
}

const Template: Story<ComponentProps<typeof BigNumberMetric>> = (props) => (
    <BigNumberMetric {...props} />
)

const defaultProps: ComponentProps<typeof BigNumberMetric> = {
    className: '',
    children: '123',
}

export const Default = Template.bind({})
Default.args = defaultProps

export const LoadingState = Template.bind({})
LoadingState.args = {
    ...defaultProps,
    isLoading: true,
}

export const WithTrendBadge = Template.bind({})
WithTrendBadge.args = {
    ...defaultProps,
    trendBadge: <TrendBadge value={123} prevValue={100} />,
}

export const WithoutDataAndWithTrendBadge = Template.bind({})
WithoutDataAndWithTrendBadge.args = {
    children: '-',
    trendBadge: <TrendBadge value={0} prevValue={0} />,
}

export default storyConfig
