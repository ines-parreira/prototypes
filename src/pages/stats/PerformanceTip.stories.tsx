import React, { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import PerformanceTip from 'pages/stats/PerformanceTip'

const storyConfig: Meta = {
    title: 'Stats/MetricCard/PerformanceTip',
    component: PerformanceTip,
    argTypes: {
        type: {
            control: {
                type: 'select',
            },
        },
    },
}

const Template: Story<ComponentProps<typeof PerformanceTip>> = (props) => (
    <>
        <PerformanceTip {...props}>
            Consider <a href="#">using XYZ</a> to improve this metric
        </PerformanceTip>
    </>
)

export const NoSentiment = Template.bind({})
NoSentiment.args = {
    avgMerchant: 4.62,
    topTen: 4.99,
}
export const WithSentiment = Template.bind({})
WithSentiment.args = {
    avgMerchant: 4.62,
    topTen: 4.99,
    type: 'light-success',
}

export const DataNotAvailable = Template.bind({})
DataNotAvailable.args = {
    avgMerchant: null,
    topTen: null,
}

export const withoutBenchMark = Template.bind({})
withoutBenchMark.args = {
    showBenchmark: false,
}

export default storyConfig
