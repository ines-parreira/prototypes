import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import BigNumberMetric from './BigNumberMetric'

const storyConfig: Meta = {
    title: 'Stats/BigNumberMetric',
    component: BigNumberMetric,
}

const Template: Story<ComponentProps<typeof BigNumberMetric>> = (props) => (
    <BigNumberMetric {...props} />
)

const defaultProps: ComponentProps<typeof BigNumberMetric> = {
    className: '',
    children: '123',
    from: '456',
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
