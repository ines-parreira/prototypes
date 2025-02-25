import React, { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import MetricTip from 'pages/stats/MetricTip'

const storyConfig: Meta = {
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

const Template: Story<ComponentProps<typeof MetricTip>> = (props) => (
    <MetricTip {...props}>{'Content of the tip'}</MetricTip>
)

const defaultProps: ComponentProps<typeof MetricTip> = {
    className: '',
    title: 'Title of the tip',
    type: 'neutral',
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
