import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'

const storyConfig: Meta = {
    title: 'Stats/BigNumberMetric',
    component: BigNumberMetric,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

type Story = StoryObj<typeof BigNumberMetric>

const Template: Story = {
    render: (props) => <BigNumberMetric {...props} />,
}

const defaultProps: ComponentProps<typeof BigNumberMetric> = {
    className: '',
    children: '123',
}

export const Default = {
    ...Template,
    args: defaultProps,
}

export const LoadingState = {
    ...Template,
    args: {
        ...defaultProps,
        isLoading: true,
    },
}

export const WithTrendBadge = {
    ...Template,
    args: {
        ...defaultProps,
        trendBadge: <TrendBadge value={123} prevValue={100} />,
    },
}

export const WithoutDataAndWithTrendBadge = {
    ...Template,
    args: {
        ...defaultProps,
        children: '-',
        trendBadge: <TrendBadge value={0} prevValue={0} />,
    },
}

export default storyConfig
