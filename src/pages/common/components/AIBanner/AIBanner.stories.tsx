import React from 'react'
import {Meta, Story} from '@storybook/react'

import AIBanner, {Props} from './AIBanner'

const storyConfig: Meta = {
    title: 'Data Display/AIBanner',
    component: AIBanner,
    argTypes: {
        className: {control: 'text'},
        hasError: {control: 'boolean'},
    },
} as Meta

const Template: Story<Props> = (args) => (
    <AIBanner {...args}>This is a banner content</AIBanner>
)

export const Default = Template.bind({})
Default.args = {
    className: '',
    hasError: false,
}

export const WithError = Template.bind({})
WithError.args = {
    className: '',
    hasError: true,
}

export default storyConfig
