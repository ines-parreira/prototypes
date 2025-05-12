import type { ComponentProps } from 'react'

import { Meta, StoryObj } from '@storybook/react'

import StatDifference from 'pages/stats/common/components/StatDifference'

import DonutKeyMetricStat from './DonutKeyMetricStat'

const storyConfig: Meta = {
    title: 'Stats/DonutKeyMetricStat',
    component: DonutKeyMetricStat,
}

type Story = StoryObj<typeof DonutKeyMetricStat>

const Template: Story = {
    render: (props) => <DonutKeyMetricStat {...props} />,
}

const defaultProps: ComponentProps<typeof DonutKeyMetricStat> = {
    value: 5.3,
    maxValue: 10,
    fill: 'success',
    formattedValue: '',
    label: '',
    differenceComponent: undefined,
}

export const Default = {
    ...Template,
    args: defaultProps,
}

export const WithDifference = {
    ...Template,
    args: {
        ...defaultProps,
        differenceComponent: (
            <StatDifference label={-50} value={-50} moreIsBetter={true} />
        ),
    },
}

export const WithZeroValue = {
    ...Template,
    args: { ...defaultProps, value: 0 },
}

export const WithFullValue = {
    ...Template,
    args: { ...defaultProps, value: 100, maxValue: 100 },
}

export const WithEmptyFill = {
    ...Template,
    args: { ...defaultProps, fill: 'empty' },
}

export default storyConfig
