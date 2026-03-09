import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { VerticalTextCarousel } from './VerticalTextCarousel'

const meta: Meta = {
    title: 'Data Display/VerticalTextCarousel',
    component: VerticalTextCarousel,
    argTypes: {
        texts: { control: 'object' },
        cta: { control: 'text' },
        ctaSuccessMessage: { control: 'text' },
        onCtaClick: { action: 'CTA clicked' },
    },
}

type TemplateProps = ComponentProps<typeof VerticalTextCarousel>

const Template: StoryObj<TemplateProps> = {
    render: function Template({ ...args }) {
        return <VerticalTextCarousel {...args} />
    },
}

export const Default = {
    ...Template,
    args: {
        texts: ['Suggestion 1', 'Suggestion 2', 'Suggestion 3'],
        cta: <button>Choose suggestion</button>,
        ctaSuccessMessage: 'You chose successfully!',
        onCtaClick: (text: string) => alert(`CTA clicked with text: ${text}`),
    },
}

export const WithoutCTA = {
    ...Template,
    args: {
        texts: ['Text 1', 'Text 2', 'Text 3'],
    },
}

export default meta
