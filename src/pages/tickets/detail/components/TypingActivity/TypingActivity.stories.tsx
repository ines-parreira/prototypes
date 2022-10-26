import React from 'react'
import {Meta, Story} from '@storybook/react'

import TypingActivity, {TypingActivityProps} from './TypingActivity'

const storyConfig: Meta = {
    title: 'Chat/TypingActivity',
    component: TypingActivity,
    argTypes: {},
}

const Template: Story<TypingActivityProps> = ({name, isTyping}) => {
    return <TypingActivity name={name} isTyping={isTyping} />
}

const defaultProps: Partial<TypingActivityProps> = {
    name: 'Customer',
    isTyping: true,
}

export const Default = Template.bind({})
Default.args = defaultProps

export const WithCustomerName = Template.bind({})
WithCustomerName.args = {...defaultProps, name: 'Toni'}

export const NotTyping = Template.bind({})
NotTyping.args = {...defaultProps, isTyping: false}

export default storyConfig
