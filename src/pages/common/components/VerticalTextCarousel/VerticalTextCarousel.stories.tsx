import {Meta, Story} from '@storybook/react'
import React from 'react'

import {
    VerticalTextCarousel,
    VerticalTextCarouselProps,
} from './VerticalTextCarousel'

const meta: Meta = {
    title: 'Data Display/VerticalTextCarousel',
    component: VerticalTextCarousel,
    argTypes: {
        texts: {control: 'array'},
        cta: {control: 'text'},
        ctaSuccessMessage: {control: 'text'},
        onCtaClick: {action: 'CTA clicked'},
    },
} as Meta

const Template: Story<VerticalTextCarouselProps> = (args) => (
    <VerticalTextCarousel {...args} />
)

export const Default = Template.bind({})
Default.args = {
    texts: ['Suggestion 1', 'Suggestion 2', 'Suggestion 3'],
    cta: <button>Choose suggestion</button>,
    ctaSuccessMessage: 'You chose successfully!',
    onCtaClick: (text) => alert(`CTA clicked with text: ${text}`),
}

export const WithoutCTA = Template.bind({})
WithoutCTA.args = {
    texts: ['Text 1', 'Text 2', 'Text 3'],
}

export default meta
