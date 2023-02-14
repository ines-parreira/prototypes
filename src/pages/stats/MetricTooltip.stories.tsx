import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import MetricTooltip from './MetricTooltip'

const storyConfig: Meta = {
    title: 'Stats/MetricTooltip',
    component: MetricTooltip,
    argTypes: {
        type: {
            control: {
                type: 'select',
            },
        },
    },
}

const Template: Story<ComponentProps<typeof MetricTooltip>> = (props) => (
    <MetricTooltip {...props} />
)

const defaultProps: ComponentProps<typeof MetricTooltip> = {
    children: 'Content of the tip',
    className: '',
    title: 'Title of the tip',
    type: 'neutral',
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
