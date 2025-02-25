import React, { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import AIBanner from './AIBanner'

const storyConfig: Meta = {
    title: 'Data Display/AIBanner',
    component: AIBanner,
    argTypes: {
        className: { control: 'text' },
        hasError: { control: 'boolean' },
        fillStyle: {
            control: 'radio',
            options: ['fill', 'ghost'],
        },
    },
} as Meta

const Template: Story<ComponentProps<typeof AIBanner>> = (args) => (
    <AIBanner {...args}>{args.children ?? 'This is a banner content'}</AIBanner>
)

export const Default = Template.bind({})
Default.args = {
    fillStyle: 'ghost',
    className: '',
    hasError: false,
}

export const WithLargeContent = Template.bind({})
WithLargeContent.args = {
    className: '',
    hasError: false,
    children:
        'Preview AI Agent’s personality, crafted using your brand’s tone of voice from your website. Fine-tune it anytime in your Settings.',
}

export const WithExtraLargeContent = Template.bind({})
WithExtraLargeContent.args = {
    className: '',
    hasError: false,
    children:
        'Preview AI Agent’s personality, crafted using your brand’s tone of voice from your website. Fine-tune it anytime in your Settings. It’s a great way to see how your AI Agent will respond to your customers. Select the primary goal you want to achieve with your AI agent. Support customers, automate repetitive tasks, generate leads, or other.',
}

export const FillStyleFill = Template.bind({})
FillStyleFill.args = {
    fillStyle: 'fill',
    className: '',
    hasError: false,
}

export const FillStyleFillWithExtraLargeContent = Template.bind({})
FillStyleFillWithExtraLargeContent.args = {
    fillStyle: 'fill',
    className: '',
    hasError: false,
    children:
        'Preview AI Agent’s personality, crafted using your brand’s tone of voice from your website. Fine-tune it anytime in your Settings. It’s a great way to see how your AI Agent will respond to your customers. Select the primary goal you want to achieve with your AI agent. Support customers, automate repetitive tasks, generate leads, or other.',
}

export const WithError = Template.bind({})
WithError.args = {
    className: '',
    hasError: true,
}

export const FillStyleFillWithError = Template.bind({})
FillStyleFillWithError.args = {
    fillStyle: 'fill',
    className: '',
    hasError: true,
}

export default storyConfig
