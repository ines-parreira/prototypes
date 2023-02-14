import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import MetricContent from './MetricContent'

const storyConfig: Meta = {
    title: 'Stats/MetricContent',
    component: MetricContent,
}

const Template: Story<ComponentProps<typeof MetricContent>> = (props) => (
    <MetricContent {...props} />
)

const defaultProps: ComponentProps<typeof MetricContent> = {
    className: '',
    children: '123',
    from: '456',
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
