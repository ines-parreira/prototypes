import React, { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import StatDifference from 'pages/stats/common/components/StatDifference'

import DonutKeyMetricStat from './DonutKeyMetricStat'

const storyConfig: Meta = {
    title: 'Stats/DonutKeyMetricStat',
    component: DonutKeyMetricStat,
}

const Template: Story<ComponentProps<typeof DonutKeyMetricStat>> = (props) => (
    <DonutKeyMetricStat {...props} />
)

const defaultProps: ComponentProps<typeof DonutKeyMetricStat> = {
    value: 5.3,
    maxValue: 10,
    fill: 'success',
    formattedValue: '',
    label: '',
    differenceComponent: undefined,
}

export const Default = Template.bind({})
Default.args = defaultProps

export const WithDifference = Template.bind({})
WithDifference.args = {
    ...defaultProps,
    differenceComponent: (
        <StatDifference label={-50} value={-50} moreIsBetter={true} />
    ),
}

export const WithZeroValue = Template.bind({})
WithZeroValue.args = { ...defaultProps, value: 0 }

export const WithFullValue = Template.bind({})
WithFullValue.args = { ...defaultProps, value: 100, maxValue: 100 }

export const WithEmptyFill = Template.bind({})
WithEmptyFill.args = { ...defaultProps, fill: 'empty' }

export default storyConfig
