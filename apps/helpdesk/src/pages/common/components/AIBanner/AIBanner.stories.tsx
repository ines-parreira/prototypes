import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import AIBanner from './AIBanner'

const storyConfig: Meta = {
    title: 'Data Display/AIBanner',
    component: AIBanner,
    argTypes: {
        className: { control: 'text' },
        hasError: { control: 'boolean' },
        fillStyle: {
            control: 'radio',
            options: ['fill', 'ghost', 'success'],
        },
    },
} as Meta

const Template: StoryObj<typeof AIBanner> = {
    render: function Template(args) {
        return (
            <AIBanner {...args}>
                {args.children ?? 'This is a banner content'}
            </AIBanner>
        )
    },
}

export const Default = {
    ...Template,
    args: {
        fillStyle: 'ghost',
        className: '',
        hasError: false,
    },
}

export const WithLargeContent = {
    ...Template,
    args: {
        className: '',
        hasError: false,
        children:
            'Preview AI Agent’s personality, crafted using a friendly tone of voice which you can fine-tune anytime in your Settings.',
    },
}

export const WithExtraLargeContent = {
    ...Template,
    args: {
        className: '',
        hasError: false,
        children:
            'Preview AI Agent’s personality, crafted using a friendly tone of voice which you can fine-tune anytime in your Settings. It’s a great way to see how your AI Agent will respond to your customers. Select the primary goal you want to achieve with your AI agent. Support customers, automate repetitive tasks, generate leads, or other.',
    },
}

export const FillStyleFill = {
    ...Template,
    args: {
        fillStyle: 'fill',
        className: '',
        hasError: false,
    },
}

export const FillStyleFillWithExtraLargeContent = {
    ...Template,
    args: {
        fillStyle: 'fill',
        className: '',
        hasError: false,
        children:
            'Preview AI Agent’s personality, crafted using your brand’s tone of voice from your website. Fine-tune it anytime in your Settings. It’s a great way to see how your AI Agent will respond to your customers. Select the primary goal you want to achieve with your AI agent. Support customers, automate repetitive tasks, generate leads, or other.',
    },
}

export const WithError = {
    ...Template,
    args: {
        className: '',
        hasError: true,
    },
}

export const FillStyleFillWithError = {
    ...Template,
    args: {
        fillStyle: 'fill',
        className: '',
        hasError: true,
    },
}

export default storyConfig
