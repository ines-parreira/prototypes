import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import PerformanceTip from 'domains/reporting/pages/common/components/PerformanceTip'

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

type Story = StoryObj<typeof PerformanceTip>

const Template: Story = {
    render: (props) => (
        <>
            <PerformanceTip {...props}>
                Consider <a href="#">using XYZ</a> to improve this metric
            </PerformanceTip>
        </>
    ),
}

export const NoSentiment = {
    ...Template,
    args: {
        avgMerchant: 4.62,
        topTen: 4.99,
    },
}

export const WithSentiment = {
    ...Template,
    args: {
        avgMerchant: 4.62,
        topTen: 4.99,
        type: 'light-success',
    },
}

export const DataNotAvailable = {
    ...Template,
    args: {
        avgMerchant: null,
        topTen: null,
    },
}

export const withoutBenchMark = {
    ...Template,
    args: {
        showBenchmark: false,
    },
}

export default storyConfig
