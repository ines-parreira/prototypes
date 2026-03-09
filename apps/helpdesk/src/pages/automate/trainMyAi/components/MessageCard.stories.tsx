import type { ComponentProps } from 'react'
import React from 'react'

import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import MessageCard from './MessageCard'

const storyConfig: Meta<typeof MessageCard> = {
    title: 'TrainMyAi/MessageCard',
    component: MessageCard,
}

const defaultProps: Omit<ComponentProps<typeof MessageCard>, 'onSelect'> = {
    isSelected: true,
    isSuccess: false,
    message: 'This is a message',
    articleTitle: 'Article title',
}

const Template: StoryFn<ComponentProps<typeof MessageCard>> = (props) => {
    return <MessageCard {...props} />
}

export const Default = Template.bind({})
Default.args = defaultProps

export const LongText = Template.bind({})
LongText.args = {
    ...defaultProps,
    isSuccess: true,
    message: 'This is a very long message. '.repeat(10),
    articleTitle: 'And long title. '.repeat(2),
}

export default storyConfig
