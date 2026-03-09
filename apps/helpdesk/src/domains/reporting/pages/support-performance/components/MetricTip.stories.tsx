import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import MetricTip from 'domains/reporting/pages/support-performance/components/MetricTip'

const storyConfig: Meta<typeof MetricTip> = {
    title: 'Stats/MetricTooltip',
    component: MetricTip,
    argTypes: {
        type: {
            control: {
                type: 'select',
            },
        },
    },
}

type Story = StoryObj<typeof MetricTip>

const Template: Story = {
    render: (props) => <MetricTip {...props}>{'Content of the tip'}</MetricTip>,
}

const defaultProps: ComponentProps<typeof MetricTip> = {
    className: '',
    title: 'Title of the tip',
    type: 'neutral',
}

export const Default = {
    ...Template,
    args: defaultProps,
}

export default storyConfig
