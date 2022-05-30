import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'

import Segmented from './Segmented'

const storyConfig: Meta = {
    title: 'Data Display/Segmented',
    component: Segmented,
}

const Template: Story<ComponentProps<typeof Segmented>> = (props) => (
    <Segmented {...props} />
)

export const Basic = Template.bind({})
Basic.args = {
    options: [
        {
            value: 'self-service',
            label: 'Self-Service',
        },
        {
            value: 'article-recommendation',
            label: 'Article Recommendation',
        },
    ],
    value: 'self-service',
    onChange: () => null,
}

export const Disabled = Template.bind({})
Disabled.args = {
    options: [
        {
            value: 'self-service',
            label: 'Self-Service',
        },
        {
            value: 'article-recommendation',
            label: 'Article Recommendation',
            disabled: true,
        },
    ],
    value: 'self-service',
    onChange: () => null,
}

export default storyConfig
