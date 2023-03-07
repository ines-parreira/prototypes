import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import TrendBadge from './TrendBadge'

const storyConfig: Meta = {
    title: 'Stats/TrendBadge',
    component: TrendBadge,
    argTypes: {
        type: {
            control: {
                type: 'select',
            },
        },
    },
}

const Template: Story<ComponentProps<typeof TrendBadge>> = (props) => (
    <TrendBadge {...props} />
)

const defaultProps: ComponentProps<typeof TrendBadge> = {
    className: '',
    children: '5%',
    direction: 'up',
    color: 'positive',
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
